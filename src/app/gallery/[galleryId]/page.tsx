import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getGalleryByFolderName, getPhotosByGallery, createClient } from '@/utils/supabase/server';

import GalleryPageClient from './GalleryPageClient';
import { Photo, Gallery } from '@/types/database';

interface GalleryPageProps {
  params: {
    galleryId: string;
  };
}

export async function generateMetadata({ params }: { params: { galleryId: string } }): Promise<Metadata> {
  try {
    const galleryIdentifier = decodeURIComponent(params.galleryId);
    
    // Try to get gallery by folder name first (most common case)
    let gallery = await getGalleryByFolderName(galleryIdentifier);
    
    // If not found by folder name, try to get by ID
    if (!gallery) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('galleries')
        .select('*')
        .eq('id', galleryIdentifier)
        .single();
        
      if (error) {
        console.error('Error fetching gallery by ID:', error);
        return {};
      }
      gallery = data;
    }
    
    if (!gallery) {
      return {};
    }

    // Get the first photo as the cover image if no specific cover is set
    const photos = await getPhotosByGallery(gallery.id);
    const coverImage = gallery.cover_image_url || (photos.length > 0 ? photos[0].public_url : '');

    return {
      title: `${gallery.title} | LuxSync`,
      description: `Gallery from ${gallery.event_date}`,
      openGraph: {
        title: gallery.title,
        description: `Gallery from ${gallery.event_date}`,
        type: 'website',
        url: `https://luxsync.vercel.app/gallery/${encodeURIComponent(gallery.folder_name)}`,
        images: coverImage ? [
          {
            url: coverImage,
            width: 1200,
            height: 630,
            alt: gallery.title,
          }
        ] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: gallery.title,
        description: `Gallery from ${gallery.event_date}`,
        images: coverImage,
      },
    };
  } catch (error) {
    console.error('Error generating metadata for gallery:', error);
    return {};
  }
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const galleryIdentifier = decodeURIComponent(params.galleryId);
  
  try {
    // Try to get gallery by folder name first (most common case)
    let gallery = await getGalleryByFolderName(galleryIdentifier);
    
    // If not found by folder name, try to get by ID
    if (!gallery) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('galleries')
        .select('*')
        .eq('id', galleryIdentifier)
        .single();
        
      if (error) {
        console.error('Error fetching gallery by ID:', error);
        notFound();
      } else {
        gallery = data;
      }
    }
    
    if (!gallery) {
      notFound();
    }
    
    const photos = await getPhotosByGallery(gallery.id);
    
    // Client component implementation
    return <GalleryPageClient photos={photos} gallery={gallery} />;
  } catch (error) {
    console.error('Error loading gallery:', error);
    return (
      <main className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-center mb-8">LuxSync Gallery</h1>
        <p className="text-red-500">Error loading gallery</p>
      </main>
    );
  }
}