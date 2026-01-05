import { createServerClient } from '@supabase/ssr'

export const createClient = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Return empty array for server components
          return [];
        },
        setAll(cookiesToSet) {
          // Do nothing in server components
        },
      },
    }
  );
};



// Add database interaction functions
export const getGalleries = async () => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('galleries')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching galleries:', error);
    throw error;
  }
  
  return data;
};

export const getPhotosByGallery = async (galleryId: string) => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('gallery_id', galleryId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching photos:', error);
    throw error;
  }
  
  return data;
};

export const getGalleryByFolderName = async (folderName: string) => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('galleries')
    .select('*')
    .eq('folder_name', folderName)
    .single();
    
  if (error) {
    console.error('Error fetching gallery:', error);
    throw error;
  }
  
  return data;
};

export const createGallery = async (galleryData: { title: string; event_date: string; folder_name: string; cover_image_url?: string }) => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('galleries')
    .insert([galleryData])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating gallery:', error);
    throw error;
  }
  
  return data;
};

export const createPhoto = async (photoData: { gallery_id: string; user_tag_id?: string; b2_file_key: string; public_url: string; width?: number; height?: number }) => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('photos')
    .insert([photoData])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating photo:', error);
    throw error;
  }
  
  return data;
};

export const getPhotosByUserHandle = async (userHandle: string) => {
  const supabase = createClient();
  
  // First get the user by handle
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('handle', userHandle)
    .single();
    
  if (userError) {
    console.error('Error fetching user:', userError);
    throw userError;
  }
  
  // Then get photos tagged to this user
  const { data: photos, error: photosError } = await supabase
    .from('photos')
    .select('*')
    .eq('user_tag_id', user.id)
    .order('created_at', { ascending: false });
    
  if (photosError) {
    console.error('Error fetching photos by user:', photosError);
    throw photosError;
  }
  
  return photos;
};

export const getPhotosByUserHandleFromB2 = async (userHandle: string) => {
  // This function will fetch photos from B2 storage based on the user handle (subfolder name)
  // This is a fallback for when we don't have the user in the database
  const { getPhotosForGallery } = await import('@/utils/b2/gallery-parser');
  
  // In the B2 structure, user photos are in subfolders named after the user handle
  // So we need to find all galleries that have photos from this user
  const { getGalleriesFromB2 } = await import('@/utils/b2/gallery-parser');
  const galleries = await getGalleriesFromB2();
  
  let allUserPhotos: any[] = [];
  
  for (const gallery of galleries) {
    // Get photos for this gallery
    const photos = await getPhotosForGallery(gallery.folderName);
    
    // Filter photos that belong to this user handle
    const userPhotos = photos.filter(photo => {
      // Extract user handle from the photo path (format: B2_BASE_PATH/gallery/userHandle/image.jpg)
      const pathParts = photo.b2_file_key.split('/');
      if (pathParts.length >= 3) {
        const extractedUserHandle = pathParts[2]; // The user handle is the third part
        return extractedUserHandle === userHandle;
      }
      return false;
    });
    
    allUserPhotos = [...allUserPhotos, ...userPhotos];
  }
  
  return allUserPhotos;
};