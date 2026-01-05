import { NextRequest } from 'next/server';
import { getPhotosForGallery } from '@/utils/b2/gallery-parser';
import JSZip from 'jszip';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ galleryId: string }> }
) {
  try {
    const { galleryId } = await params;
    
    if (!galleryId) {
      return Response.json(
        { error: 'galleryId is required' },
        { status: 400 }
      );
    }

    // Get all photos for the gallery
    const photos = await getPhotosForGallery(galleryId);
    
    if (!photos || photos.length === 0) {
      return Response.json(
        { error: 'No photos found in the gallery' },
        { status: 404 }
      );
    }

    // Create a ZIP file with all the photos
    const zip = new JSZip();
    
    // Add each photo to the ZIP
    for (const photo of photos) {
      try {
        // Fetch the image from B2
        const response = await fetch(photo.public_url);
        if (response.ok) {
          const imageBuffer = await response.arrayBuffer();
          const filename = photo.id.split('/').pop() || `photo_${Date.now()}.jpg`;
          zip.file(filename, Buffer.from(imageBuffer));
        }
      } catch (error) {
        console.error(`Error fetching photo ${photo.id}:`, error);
        // Continue with other photos even if one fails
      }
    }
    
    // Generate the ZIP file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Convert blob to array buffer
    const arrayBuffer = await zipBlob.arrayBuffer();
    
    // Create response with ZIP file
    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${galleryId.replace(/[^a-z0-9]/gi, '_')}_gallery.zip"`,
      },
    });
  } catch (error) {
    console.error('Error in gallery download API:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}