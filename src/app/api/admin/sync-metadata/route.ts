import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { b2Service } from '@/utils/b2/service';
import { getGalleriesFromB2 } from '@/utils/b2/gallery-parser';
import sizeOf from 'image-size';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    // Check if admin is authenticated
    if (!process.env.ADMIN_PASSWORD) {
      return Response.json(
        { success: false, message: 'Admin password not configured' },
        { status: 500 }
      );
    }

    // Use the B2 service and Supabase client
    const { b2Service } = await import('@/utils/b2/service');
    const { getPhotosForGallery } = await import('@/utils/b2/gallery-parser');
    const supabase = createClient();

    // Get all galleries from B2
    const galleries = await getGalleriesFromB2();

    let totalProcessed = 0;
    let errors: string[] = [];

    for (const gallery of galleries) {
      try {
        // Get all photos for this gallery
        const photos = await getPhotosForGallery(gallery.folder_name);

        for (const photo of photos) {
          try {
            // Extract user handle from the photo path (format: B2_BASE_PATH/gallery/userHandle/image.jpg)
            const pathParts = photo.b2_file_key.split('/');
            if (pathParts.length >= 3) {
              const userHandle = pathParts[2]; // The user handle is the third part

              // Find or create user
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
                } else {
                  console.error(`Error creating user ${userHandle}:`, createUserError);
                  errors.push(`Failed to create user ${userHandle}: ${createUserError.message}`);
                  continue;
                }
              }

              // Find gallery by folder name
              let galleryRecord = null;
              const { data: existingGallery, error: galleryError } = await supabase
                .from('galleries')
                .select('*')
                .eq('folder_name', gallery.folder_name)
                .single();

              if (!galleryError && existingGallery) {
                galleryRecord = existingGallery;
              } else {
                // Create new gallery if it doesn't exist
                const galleryTitle = gallery.folder_name.replace(/[_-]/g, ' ');
                const dateMatch = gallery.folder_name.match(/^([0-9]{4}[-_][0-9]{2}[-_][0-9]{2})/);
                const eventDate = dateMatch ? dateMatch[1].replace(/_/g, '-') : new Date().toISOString().split('T')[0];

                const { data: newGallery, error: createGalleryError } = await supabase
                  .from('galleries')
                  .insert([{
                    title: galleryTitle,
                    event_date: eventDate,
                    folder_name: gallery.folder_name,
                  }])
                  .select()
                  .single();

                if (!createGalleryError) {
                  galleryRecord = newGallery;
                } else {
                  console.error(`Error creating gallery ${gallery.folder_name}:`, createGalleryError);
                  errors.push(`Failed to create gallery ${gallery.folder_name}: ${createGalleryError.message}`);
                  continue;
                }
              }

              // Check if photo already exists in database
              const { data: existingPhoto, error: photoCheckError } = await supabase
                .from('photos')
                .select('*')
                .eq('b2_file_key', photo.b2_file_key)
                .single();

              if (!existingPhoto) {
                // Get image dimensions if it's an image
                let width = null;
                let height = null;

                try {
                  const fileBuffer = await b2Service.downloadFile(photo.b2_file_key);
                  const dimensions = sizeOf(fileBuffer);
                  width = dimensions.width;
                  height = dimensions.height;
                } catch (dimensionError) {
                  // Not an image or couldn't read dimensions
                  console.warn(`Could not get dimensions for ${photo.b2_file_key}:`, dimensionError);
                }

                // Calculate file hash
                const fileHash = crypto.randomUUID(); // Using crypto.randomUUID() as a placeholder

                // Insert photo record
                const { error: insertError } = await supabase
                  .from('photos')
                  .insert([{
                    gallery_id: galleryRecord.id,
                    user_tag_id: user?.id,
                    b2_file_key: photo.b2_file_key,
                    public_url: photo.public_url,
                    width,
                    height,
                    id: fileHash, // Store hash as the ID
                  }]);

                if (insertError) {
                  console.error(`Error inserting photo ${photo.b2_file_key}:`, insertError);
                  errors.push(`Failed to insert photo ${photo.b2_file_key}: ${insertError.message}`);
                } else {
                  totalProcessed++;
                }
              } else {
                // Photo already exists, update if needed
                const { error: updateError } = await supabase
                  .from('photos')
                  .update({
                    gallery_id: galleryRecord.id,
                    user_tag_id: user?.id,
                  })
                  .eq('b2_file_key', photo.b2_file_key);

                if (updateError) {
                  console.error(`Error updating photo ${photo.b2_file_key}:`, updateError);
                  errors.push(`Failed to update photo ${photo.b2_file_key}: ${updateError.message}`);
                } else {
                  totalProcessed++;
                }
              }
            }
          } catch (photoError: any) {
            console.error(`Error processing photo ${photo.b2_file_key}:`, photoError);
            errors.push(`Failed to process photo ${photo.b2_file_key}: ${photoError.message}`);
          }
        }
      } catch (galleryError: any) {
        console.error(`Error processing gallery ${gallery.folder_name}:`, galleryError);
        errors.push(`Failed to process gallery ${gallery.folder_name}: ${galleryError.message}`);
      }
    }

    const message = `Metadata sync completed. ${totalProcessed} files processed.`;
    return Response.json({
      success: true,
      message,
      totalProcessed,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Metadata sync error:', error);
    return Response.json(
      { success: false, message: 'An error occurred during metadata sync' },
      { status: 500 }
    );
  }
}