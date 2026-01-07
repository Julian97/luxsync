'use client';

import { useState, useEffect } from 'react';
import MasonryGallery from '@/components/MasonryGallery';
import PhotoModal from '@/components/modal/PhotoModal';
import { Photo, Gallery } from '@/types/database';
import JSZip from 'jszip';

interface UserGalleryClientProps {
  userId: string;
}

export default function UserGalleryClient({ userId }: UserGalleryClientProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [userHandle, setUserHandle] = useState<string | null>(null);
  const [isGalleryDownloading, setIsGalleryDownloading] = useState(false);

  useEffect(() => {
    const fetchUserPhotos = async () => {
      try {
        setUserHandle(userId);
        
        // Fetch user photos via API route
        const response = await fetch(`/api/photos/user/${encodeURIComponent(userId)}`);
        const data = await response.json();
        
        if (data.photos) {
          setPhotos(data.photos);
        } else {
          setError('No photos found for this user');
        }
      } catch (err: any) {
        console.error('Error fetching user photos:', err);
        setError(`Failed to load photos for user ${userId}: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPhotos();
  }, [userId]);

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  const handleModalClose = () => {
    setSelectedPhoto(null);
  };

  const handleDownload = async (photo: Photo) => {
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = photo.public_url;
    link.download = photo.id.split('/').pop() || 'photo.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadGallery = async () => {
    setIsGalleryDownloading(true);
    try {
      // This would download all photos for the user
      // Create a zip of all user photos
      const zip = new JSZip();
      const promises = [];
      
      for (const photo of photos) {
        const response = await fetch(photo.public_url);
        const blob = await response.blob();
        const fileName = photo.id.split('/').pop() || 'photo.jpg';
        zip.file(fileName, blob);
      }
      
      const content = await zip.generateAsync({type:"blob"});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${userId}_gallery.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error downloading user gallery:', error);
    } finally {
      setIsGalleryDownloading(false);
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-center mb-8">LuxSync Gallery</h1>
        <p>Loading photos for {userId}...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-center mb-8">LuxSync Gallery</h1>
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">LuxSync Gallery</h1>
        <h2 className="text-2xl font-semibold text-gray-800">Photos for {userHandle}</h2>
        <p className="text-gray-600">User: {userHandle}</p>
        <p className="text-gray-500 text-sm mt-1">User ID: {userHandle}</p>
        <div className="mt-4">
          <button
            onClick={handleDownloadGallery}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center mx-auto"
            disabled={isGalleryDownloading}
          >
            {isGalleryDownloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Gallery
              </>
            )}
          </button>
        </div>
      </div>
      
      {photos.length > 0 ? (
        <MasonryGallery photos={photos} onPhotoClick={handlePhotoClick} />
      ) : (
        <div className="text-center py-12">
          <p>No photos found for user {userHandle}.</p>
          <p>Check if the user exists and has photos tagged to them.</p>
        </div>
      )}
      
      {selectedPhoto && (
        <PhotoModal 
          photo={selectedPhoto} 
          onClose={handleModalClose} 
          onDownload={handleDownload} 
        />
      )}
    </main>
  );
}