import { b2Service } from './service';
import { Photo, Gallery } from '@/types/database';

export interface GalleryFolder {
  id: string;
  title: string;
  eventDate: string;
  folderName: string;
  coverImage?: string;
  accessPin?: string;
}

/**
 * Parse gallery folders from B2 storage
 */
export async function getGalleriesFromB2(): Promise<Gallery[]> {
  try {
    console.log('Attempting to fetch galleries from B2');
    console.log('B2_PUBLIC_URL:', process.env.B2_PUBLIC_URL);
    console.log('B2_BUCKET_NAME:', process.env.B2_BUCKET_NAME);
    console.log('B2_BASE_PATH:', process.env.B2_BASE_PATH);
    
    // List all objects in the base path
    console.log('About to list objects with B2_BASE_PATH:', process.env.B2_BASE_PATH);
    const result = await b2Service.listObjects('', 1000);
    console.log('Listed objects:', result.objects.length, 'objects found');
    if (result.objects.length > 0) {
      console.log('Sample of first few object keys:', result.objects.slice(0, 5).map(obj => obj.Key));
      
      // Debug: Look for objects that match our expected structure
      const potentialGalleries = result.objects.filter(obj => {
        if (!obj.Key) return false;
        const pathParts = obj.Key.split('/');
        return pathParts.length >= 3 && obj.Key.includes('B2 LuxSync');
      });
      console.log('Potential gallery objects:', potentialGalleries.slice(0, 10).map(obj => obj.Key));
    }
    
    // Extract unique gallery folders from the object keys
    const galleryFolders = new Set<string>();
    
    result.objects.forEach(obj => {
      if (obj.Key) {
        console.log('Processing object key for gallery detection:', obj.Key);
        // Extract the gallery folder name from the path
        // Path format: B2 LuxSync/2026-01-05 Miku Expo/xymiku/xymikuIMG20251227163910.jpg
        const pathParts = obj.Key.split('/');
        console.log('Path parts:', pathParts);
        if (pathParts.length >= 3) { // At least basepath/gallery/user/image
          const galleryName = pathParts[1]; // The gallery folder name
          console.log('Extracted gallery name:', galleryName);
          if (galleryName) {
            // Only add if it looks like a gallery folder (has date format)
            if (galleryName.match(/^([0-9]{4}[-_][0-9]{2}[-_][0-9]{2})/)) {
              galleryFolders.add(galleryName);
              console.log('Added gallery:', galleryName);
            } else {
              console.log('Skipping non-gallery folder:', galleryName);
            }
          }
        }
      }
    });
    
    console.log('Found gallery folders:', Array.from(galleryFolders));
    
    // Convert to Gallery objects
    const galleries: Gallery[] = Array.from(galleryFolders).map(folderName => {
      // Extract date and title from folder name (format: YYYY-MM-DD Title or YYYY_MM_DD Title)
      const dateMatch = folderName.match(/^(\d{4}[-_]\d{2}[-_]\d{2})\s+(.+)$/);
      
      if (dateMatch) {
        return {
          id: folderName, // Using folder name as ID for now
          title: dateMatch[2].trim(),
          event_date: dateMatch[1],
          folder_name: folderName,
          cover_image_url: getCoverImageForGallery(result.objects, folderName) || '',
          access_pin: undefined, // Default to no PIN protection
        };
      } else {
        // If no date in folder name, use the full name as title
        return {
          id: folderName,
          title: folderName,
          event_date: new Date().toISOString().split('T')[0], // Use current date as fallback
          folder_name: folderName,
          cover_image_url: getCoverImageForGallery(result.objects, folderName) || '',
          access_pin: undefined, // Default to no PIN protection
        };
      }
    });
    
    return galleries;
  } catch (error) {
    console.error('Error getting galleries from B2:', error);
    throw error;
  }
}

/**
 * Get photos for a specific gallery from B2
 */
export async function getPhotosForGallery(galleryFolder: string): Promise<Photo[]> {
  try {
    console.log('Attempting to fetch photos for gallery:', galleryFolder);
    console.log('B2_PUBLIC_URL:', process.env.B2_PUBLIC_URL);
    console.log('B2_BUCKET_NAME:', process.env.B2_BUCKET_NAME);
    console.log('B2_BASE_PATH:', process.env.B2_BASE_PATH);
    
    // List all objects in the specific gallery folder
    // Since galleryFolder is the name like '2026-01-05 Miku Expo', we need to search for it in the path
    const allObjectsResult = await b2Service.listObjects('', 1000);
    
    console.log('Looking for gallery:', galleryFolder, 'in', allObjectsResult.objects.length, 'total objects');
    
    // Filter objects that belong to the specific gallery
    // Path format in bucket is like: B2 LuxSync/2026-01-05 Miku Expo/xymiku/xymikuIMG20251227163910.jpg
    const result = {
      objects: allObjectsResult.objects.filter(obj => {
        if (!obj.Key) return false;
        // Debug logging to see what paths are being processed
        console.log('Checking object key:', obj.Key, 'for gallery:', galleryFolder);
        return obj.Key.includes(`${galleryFolder}/`);
      }),
      isTruncated: false,
      nextContinuationToken: null,
    };
    
    console.log('Found', result.objects.length, 'objects for gallery:', galleryFolder);
    
    // Extract photos from the objects
    const photos: Photo[] = [];
    
    for (const obj of result.objects) {
      if (obj.Key && obj.Size && obj.LastModified) {
        // Extract user handle from path (format: B2_BASE_PATH/gallery/user/image.jpg)
        const pathParts = obj.Key.split('/');
        if (pathParts.length >= 3) {
          const galleryName = pathParts[1];
          const userHandle = pathParts[2];
          const fileName = pathParts[pathParts.length - 1];
          
          // Skip if this is not an image file
          if (isImageFile(fileName)) {
            // Extract dimensions from metadata or filename
            const dimensionMatch = fileName.match(/_(\d+)x(\d+)\./);
            
            // Default to 3:2 portrait orientation
            let width = 600;
            let height = 900;
            
            // If dimensions are in filename, use those
            if (dimensionMatch) {
              width = parseInt(dimensionMatch[1]);
              height = parseInt(dimensionMatch[2]);
            } else {
              // Try to get dimensions from B2 metadata
              try {
                const metadata = await b2Service.getObjectMetadata(obj.Key);
                
                // Check if width and height are stored in B2 metadata
                if (metadata.metadata && metadata.metadata.width && metadata.metadata.height) {
                  width = parseInt(metadata.metadata.width);
                  height = parseInt(metadata.metadata.height);
                }
              } catch (metadataError) {
                console.error('Error fetching metadata for image:', obj.Key, metadataError);
                // Use default dimensions if metadata fetch fails
              }
            }
            
            // B2 uses + signs to encode spaces in URLs, not %20
            const encodedKey = obj.Key.replace(/ /g, '+');
            const originalUrl = `${process.env.B2_PUBLIC_URL}/file/${process.env.B2_BUCKET_NAME}/${encodedKey}`;
            
            photos.push({
              id: obj.Key, // Using the full key as ID
              gallery_id: galleryName,
              user_tag_id: userHandle, // This maps to the user handle from the path
              b2_file_key: obj.Key,
              public_url: originalUrl, // Original resolution
              optimized_url: originalUrl, // For now, same as original - in production, this would be a CDN or service URL
              width,
              height,
            });
          }
        }
      }
    }
    
    return photos;
  } catch (error) {
    console.error('Error getting photos for gallery from B2:', error);
    throw error;
  }
}

/**
 * Get cover image for a gallery
 */
function getCoverImageForGallery(objects: any[], galleryName: string): string | undefined {
  for (const obj of objects) {
    if (obj.Key && obj.Key.includes(`/${galleryName}/`)) {
      const pathParts = obj.Key.split('/');
      if (pathParts.length >= 3 && isImageFile(pathParts[pathParts.length - 1])) {
        // Return the first image found in the gallery as cover
        // B2 uses + signs to encode spaces in URLs, not %20
        const encodedKey = obj.Key.replace(/ /g, '+');
        return `${process.env.B2_PUBLIC_URL}/file/${process.env.B2_BUCKET_NAME}/${encodedKey}`;
      }
    }
  }
  return undefined;
}

/**
 * Check if a file is an image
 */
function isImageFile(fileName: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return imageExtensions.includes(ext);
}