import { getGalleries, getPhotosByGallery } from '@/utils/supabase/server';
import HomePageClient from './HomePageClient';

import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  // Default metadata for the main page
  return {
    title: 'LuxSync - Client Photo Gallery',
    description: 'A photo gallery platform for clients to view and download their photos',
    openGraph: {
      title: 'LuxSync Gallery',
      description: 'Browse and download your photos from LuxSync',
      type: 'website',
      url: 'https://luxsync.vercel.app',
    },
  };
}

export default async function Home() {
  // Fetch data server-side
  try {
    // Try to fetch from database first
    const galleries = await getGalleries();
    
    // If we have galleries in the database, use them
    if (galleries && galleries.length > 0) {
      const firstGallery = galleries[0];
      
      // Get photos for the first gallery
      const photos = await getPhotosByGallery(firstGallery.id);
      
      return <HomePageClient 
        initialPhotos={photos} 
        initialGallery={firstGallery} 
        initialError={null} 
      />;
    }
  } catch (error: any) {
    console.error('Database access failed, falling back to B2 storage:', error);
  }
  
  // If database is empty or failed, try to sync from B2
  try {
    console.log('Database empty or failed, attempting to sync from B2...');
    const { syncGalleriesToDatabase } = await import('@/utils/sync/gallery-sync');
    await syncGalleriesToDatabase();
    
    // Try to fetch galleries again after sync
    const syncedGalleries = await getGalleries();
    
    if (syncedGalleries && syncedGalleries.length > 0) {
      console.log('Successfully synced galleries from B2, returning first gallery:', syncedGalleries[0]);
      const firstGallery = syncedGalleries[0];
      const photos = await getPhotosByGallery(firstGallery.id);
      
      return <HomePageClient 
        initialPhotos={photos} 
        initialGallery={firstGallery} 
        initialError={null} 
      />;
    }
  } catch (syncError) {
    console.error('Sync failed, falling back to B2 directly:', syncError);
  }
  
  // If sync also fails, try B2 directly
  try {
    console.log('Attempting to load galleries from B2 storage directly...');
    const { getGalleriesFromB2 } = await import('@/utils/b2/gallery-parser');
    const b2Galleries = await getGalleriesFromB2();
    
    if (b2Galleries && b2Galleries.length > 0) {
      const firstGallery = b2Galleries[0];
      
      // Get photos for the first gallery from B2
      const { getPhotosForGallery } = await import('@/utils/b2/gallery-parser');
      const photos = await getPhotosForGallery(firstGallery.folder_name);
      
      console.log(`Loaded ${photos.length} photos from B2 for gallery ${firstGallery.title}`);
      
      return <HomePageClient 
        initialPhotos={photos} 
        initialGallery={firstGallery} 
        initialError={null} 
      />;
    }
  } catch (b2Error: any) {
    console.error('Error loading from B2 directly:', b2Error);
  }
  
  // If everything fails
  return <HomePageClient 
    initialPhotos={[]} 
    initialGallery={null} 
    initialError={'No galleries found in database or B2 storage'} 
  />;
}