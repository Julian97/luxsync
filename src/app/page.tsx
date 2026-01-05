'use client';

import { useState, useEffect } from 'react';
import MasonryGallery from '@/components/MasonryGallery';
import { Photo } from '@/types/database';
import { getPhotosForGallery } from '@/utils/b2/gallery-parser';

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        // For now, fetch from a default gallery
        // In a real implementation, you might want to allow users to select which gallery to view
        const galleryPhotos = await getPhotosForGallery('2026-01-05 Miku Expo'); // Default gallery name
        setPhotos(galleryPhotos);
      } catch (err) {
        console.error('Error fetching photos:', err);
        setError('Failed to load photos from B2 storage');
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  const handlePhotoClick = (photo: Photo) => {
    console.log('Photo clicked:', photo);
    // In a real app, this might open a modal or navigate to a detail page
    alert(`Photo clicked: ${photo.id}`);
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-center mb-8">LuxSync Gallery</h1>
        <p>Loading photos...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-center mb-8">LuxSync Gallery</h1>
        <p className="text-red-500">{error}</p>
        <p>Make sure your B2 credentials are configured correctly in the environment variables.</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">LuxSync Gallery</h1>
      {photos.length > 0 ? (
        <MasonryGallery photos={photos} onPhotoClick={handlePhotoClick} />
      ) : (
        <div className="text-center py-12">
          <p>No photos found in the gallery.</p>
          <p>Check your B2 storage for images in the 'B2 LuxSync' subfolder.</p>
        </div>
      )}
    </main>
  );
}