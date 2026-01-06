import { getGalleriesFromB2 } from '@/utils/b2/gallery-parser';
import { getPhotosForGallery } from '@/utils/b2/gallery-parser';
import { b2Service } from '@/utils/b2/service';
import { createGallery, createPhoto, getGalleryByFolderName, getGalleries, deleteGallery, getUserByHandle, createUser } from '@/utils/supabase/server';

/**
 * Synchronize galleries and photos from B2 storage to Supabase database
 * This function should be run periodically or when new galleries are detected
 */
export const syncGalleriesToDatabase = async () => {
  try {
    console.log('Starting comprehensive sync from B2 to Supabase...');
    
    // Get all galleries from B2
    console.log('Fetching galleries from B2 for sync...');
    const b2Galleries = await getGalleriesFromB2();
    console.log('Received', b2Galleries.length, 'galleries from B2:', b2Galleries.map(g => g.title));
    
    // Get all current galleries from database to identify deletions
    const currentDbGalleries = await getGalleries();
    
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
          const dateMatch = b2Gallery.folder_name.match(/^([0-9]{4}[-_][0-9]{2}[-_][0-9]{2})\s+(.+)$/);
          const eventDate = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
          const title = dateMatch ? dateMatch[2].trim() : b2Gallery.folder_name;
          
          dbGallery = await createGallery({
            title,
            event_date: eventDate,
            folder_name: b2Gallery.folder_name,
          });
          
          console.log(`Created gallery in database: ${b2Gallery.folder_name}`);
        }
        
        // Get all users in this gallery from B2 paths
        const b2Users = await getUsersForGallery(b2Gallery.folder_name);
        
        // Process users and create them if they don't exist
        for (const userHandle of b2Users) {
          try {
            // Check if user already exists
            let dbUser = null;
            try {
              dbUser = await getUserByHandle(userHandle);
            } catch (error) {
              // User doesn't exist, we'll create it
            }
            
            if (!dbUser) {
              // Create user in database
              await createUser({
                handle: userHandle,
                display_name: userHandle,
              });
              console.log(`Created user in database: ${userHandle}`);
            }
          } catch (userError) {
            console.log(`User already exists or error creating: ${userHandle}`, userError);
          }
        }
        
        // Get photos for this gallery from B2
        const b2Photos = await getPhotosForGallery(b2Gallery.folder_name);
        
        // Add photos to database if they don't exist
        for (const photo of b2Photos) {
          try {
            // Extract user handle from the photo path to link to user
            const pathParts = photo.b2_file_key.split('/');
            let userHandle = null;
            if (pathParts.length >= 3) {
              userHandle = pathParts[2]; // The user folder name
            }
            
            // Get user ID if user exists
            let userTagId = null;
            if (userHandle) {
              try {
                const dbUser = await getUserByHandle(userHandle);
                userTagId = dbUser.id;
              } catch (userError) {
                // User doesn't exist in DB, leave userTagId as null
                console.log(`User ${userHandle} doesn't exist in DB for photo ${photo.b2_file_key}`);
              }
            }
            
            // Create photo in database
            await createPhoto({
              gallery_id: dbGallery.id,
              user_tag_id: userTagId,
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
    
    // Clean up: Remove galleries that no longer exist in B2
    for (const dbGallery of currentDbGalleries) {
      const existsInB2 = b2Galleries.some(b2Gallery => b2Gallery.folder_name === dbGallery.folder_name);
      if (!existsInB2) {
        // Delete gallery and its photos (due to CASCADE)
        await deleteGallery(dbGallery.id);
        console.log(`Deleted gallery from database (no longer exists in B2): ${dbGallery.folder_name}`);
      }
    }
    
    console.log('Comprehensive sync completed successfully');
  } catch (error) {
    console.error('Error during comprehensive gallery sync:', error);
    throw error;
  }
};

/**
 * Get all unique user handles for a specific gallery from B2
 */
async function getUsersForGallery(galleryFolder: string): Promise<string[]> {
  console.log('Fetching users for gallery:', galleryFolder);
  
  // List all objects in the specific gallery folder
  const allObjectsResult = await b2Service.listObjects('', 1000);
  
  // Filter objects that belong to the specific gallery
  const galleryObjects = allObjectsResult.objects.filter(obj => {
    if (!obj.Key) return false;
    return obj.Key.includes(`${galleryFolder}/`);
  });
  
  // Extract unique user handles from the path structure
  // Path format: B2 LuxSync/2026-01-05 Miku Expo/xymiku/xymikuIMG20251227163910.jpg
  const userHandles = new Set<string>();
  
  for (const obj of galleryObjects) {
    if (obj.Key) {
      const pathParts = obj.Key.split('/');
      if (pathParts.length >= 3) { // At least basepath/gallery/user/image
        const userHandle = pathParts[2]; // The user folder name
        if (userHandle) {
          userHandles.add(userHandle);
        }
      }
    }
  }
  
  console.log('Found user handles for gallery:', galleryFolder, Array.from(userHandles));
  return Array.from(userHandles);
}