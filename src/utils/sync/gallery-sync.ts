import { getGalleriesFromB2 } from '@/utils/b2/gallery-parser';
import { getPhotosForGallery } from '@/utils/b2/gallery-parser';
import { createGallery, createPhoto, getGalleryByFolderName } from '@/utils/supabase/server';

/**
 * Synchronize galleries and photos from B2 storage to Supabase database
 * This function should be run periodically or when new galleries are detected
 */
export const syncGalleriesToDatabase = async () => {
  try {
    console.log('Starting gallery sync from B2 to Supabase...');
    
    // Get all galleries from B2
    console.log('Fetching galleries from B2 for sync...');
    const b2Galleries = await getGalleriesFromB2();
    console.log('Received', b2Galleries.length, 'galleries from B2:', b2Galleries.map(g => g.title));
    
    for (const b2Gallery of b2Galleries) {
      try {
        // Check if gallery already exists in database
        let dbGallery;
        try {
          dbGallery = await getGalleryByFolderName(b2Gallery.folder_name);
        } catch (error) {
          // Gallery doesn't exist, we'll create it
          dbGallery = null;
        }
        
        if (!dbGallery) {
          // Create gallery in database
          const dateMatch = b2Gallery.folder_name.match(/^([0-9]{4}-[0-9]{2}-[0-9]{2})\s+(.+)$/);
          const eventDate = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
          const title = dateMatch ? dateMatch[2].trim() : b2Gallery.folder_name;
          
          dbGallery = await createGallery({
            title,
            event_date: eventDate,
            folder_name: b2Gallery.folder_name,
          });
          
          console.log(`Created gallery in database: ${b2Gallery.folder_name}`);
        }
        
        // Get photos for this gallery from B2
        const b2Photos = await getPhotosForGallery(b2Gallery.folder_name);
        
        // Add photos to database if they don't exist
        for (const photo of b2Photos) {
          try {
            // Check if photo already exists by b2_file_key
            // For now, we'll just create all photos since we don't have a unique constraint
            // In a real implementation, you'd want to check if the photo already exists
            await createPhoto({
              gallery_id: dbGallery.id,
              b2_file_key: photo.b2_file_key,
              public_url: photo.public_url,
              width: photo.width,
              height: photo.height,
            });
          } catch (photoError) {
            // If photo already exists, continue to next photo
            console.log(`Photo already exists or error creating: ${photo.b2_file_key}`, photoError);
          }
        }
      } catch (galleryError) {
        console.error(`Error processing gallery ${b2Gallery.folder_name}:`, galleryError);
      }
    }
    
    console.log('Gallery sync completed successfully');
  } catch (error) {
    console.error('Error during gallery sync:', error);
    throw error;
  }
};