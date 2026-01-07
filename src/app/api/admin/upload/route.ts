import { NextRequest } from 'next/server';
import { b2Service } from '@/utils/b2/service';
import { createClient } from '@/utils/supabase/server';
import sizeOf from 'image-size';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    // Check if admin is authenticated (in a real app, you'd verify a session token)
    if (!process.env.ADMIN_PASSWORD) {
      return Response.json(
        { success: false, message: 'Admin password not configured' },
        { status: 500 }
      );
    }

    // For multipart form data (file uploads), we need to handle it differently
    // This is a simplified version - in a real app you'd process the multipart data properly
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folderPath = formData.get('folderPath') as string || '';

    if (files.length === 0) {
      return Response.json(
        { success: false, message: 'No files provided' },
        { status: 400 }
      );
    }

    // Use the B2 service
    const { b2Service } = await import('@/utils/b2/service');

    let processedFiles = 0;
    const errors: string[] = [];

    for (const file of files) {
      try {
        // Convert File to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Get image dimensions if it's an image
        let width, height;
        try {
          const dimensions = sizeOf(buffer);
          width = dimensions.width;
          height = dimensions.height;
        } catch (error) {
          // Not an image or couldn't read dimensions
          width = null;
          height = null;
        }

        // Generate a unique filename to hash the original name
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        const hashedFileName = `${crypto.randomUUID()}.${fileExtension}`;
        
        // Construct the full B2 path
        const b2Path = `B2 LuxSync/${folderPath}/${hashedFileName}`.replace('//', '/');

        // Upload to B2 using the service
        await b2Service.uploadFile(buffer, hashedFileName, folderPath, file.type);

        // Calculate file hash (using a simple approach, in real app use proper hashing)
        const fileHash = await calculateFileHash(buffer);

        // Store metadata in Supabase
        const supabase = createClient();
        
        // First, ensure gallery exists
        const galleryName = folderPath.split('/')[0]; // Extract gallery name from path
        let gallery = null;
        
        // Try to find existing gallery
        const { data: existingGallery, error: galleryError } = await supabase
          .from('galleries')
          .select('*')
          .eq('folder_name', galleryName)
          .single();
          
        if (!galleryError && existingGallery) {
          gallery = existingGallery;
        } else {
          // Create new gallery if it doesn't exist
          const galleryTitle = galleryName.replace(/[_-]/g, ' ');
          const dateMatch = galleryName.match(/^(\d{4}[-_]\d{2}[-_]\d{2})/);
          const eventDate = dateMatch ? dateMatch[1].replace(/_/g, '-') : new Date().toISOString().split('T')[0];
          
          const { data: newGallery, error: createError } = await supabase
            .from('galleries')
            .insert([{
              title: galleryTitle,
              event_date: eventDate,
              folder_name: galleryName,
            }])
            .select()
            .single();
            
          if (!createError) {
            gallery = newGallery;
          }
        }

        // Find or create user based on folder path
        const userHandle = folderPath.split('/')[1] || 'unknown'; // Extract user from path
        let user = null;
        
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('handle', userHandle)
          .single();
          
        if (!userError && existingUser) {
          user = existingUser;
        } else {
          // Create new user if it doesn't exist
          const { data: newUser, error: createUserError } = await supabase
            .from('users')
            .insert([{
              handle: userHandle,
              display_name: userHandle,
            }])
            .select()
            .single();
            
          if (!createUserError) {
            user = newUser;
          }
        }

        // Insert photo record
        if (gallery) {
          const publicUrl = b2Service.getPublicUrl(b2Path);
          
          const { error: photoError } = await supabase
            .from('photos')
            .insert([{
              gallery_id: gallery.id,
              user_tag_id: user?.id,
              b2_file_key: b2Path,
              public_url: publicUrl,
              width,
              height,
              // Store original filename for reference (but not in the B2 path)
              id: fileHash,
            }]);
            
          if (photoError) {
            console.error('Error inserting photo:', photoError);
            errors.push(`Failed to save metadata for ${file.name}: ${photoError.message}`);
          }
        }

        processedFiles++;
      } catch (fileError: any) {
        console.error('Error processing file:', file.name, fileError);
        errors.push(`Failed to upload ${file.name}: ${fileError.message || 'Unknown error'}`);
      }
    }

    const message = `Upload completed. ${processedFiles} files processed.`;
    return Response.json({
      success: true,
      message,
      processedFiles,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json(
      { success: false, message: 'An error occurred during upload' },
      { status: 500 }
    );
  }
}

// Simple file hash calculation (in a real app, use proper crypto)
async function calculateFileHash(buffer: Buffer): Promise<string> {
  // This is a very simplified approach
  // In a real application, you'd use crypto to generate a proper hash
  return crypto.randomUUID(); // Using crypto.randomUUID() as a placeholder
}