'use client';

import { useEffect, useState } from 'react';
import { Photo } from '@/types/database';

interface PhotoModalProps {
  photo: Photo | null;
  onClose: () => void;
  onDownload: (photo: Photo) => void;
}

const PhotoModal: React.FC<PhotoModalProps> = ({ photo, onClose, onDownload }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Close modal when pressing Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!photo) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-6xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 z-10 hover:bg-opacity-70 transition-all"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative max-h-[80vh] flex items-center justify-center">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-white text-lg">Loading...</div>
            </div>
          )}
          <img
            src={photo.public_url}
            alt={`Gallery photo ${photo.id}`}
            className={`max-h-[80vh] max-w-full object-contain ${loaded ? 'block' : 'hidden'}`}
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)} // Show the image even if there's an error
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 pt-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-white">
            <div className="mb-2 sm:mb-0">
              <h3 className="text-xl font-bold">{photo.id.split('/').pop()}</h3>
              <p className="text-sm text-gray-300">Dimensions: {photo.width} x {photo.height}</p>
            </div>
            <button
              onClick={() => onDownload(photo)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;