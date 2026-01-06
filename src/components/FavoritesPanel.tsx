'use client';

import { useState, useEffect } from 'react';

const FavoritesPanel = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = JSON.parse(localStorage.getItem('luxsync_favorites') || '[]');
    setFavorites(savedFavorites);
  }, []);

  const copyFilenames = () => {
    if (favorites.length === 0) {
      alert('No favorites to copy');
      return;
    }

    // Extract filenames from the full paths
    const filenames = favorites.map(id => {
      const pathParts = id.split('/');
      return pathParts[pathParts.length - 1]; // Get the last part which is the filename
    });

    const textToCopy = filenames.join('\n');
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy: ', err);
      alert('Failed to copy to clipboard');
    });
  };

  const clearFavorites = () => {
    if (confirm('Are you sure you want to clear all favorites?')) {
      localStorage.removeItem('luxsync_favorites');
      setFavorites([]);
    }
  };

  if (favorites.length === 0) {
    return null; // Don't show the panel if there are no favorites
  }

  return (
    <div className="fixed top-4 right-4 z-40 bg-white rounded-lg shadow-lg p-4 max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-gray-800">Favorites ({favorites.length})</h3>
        <button 
          onClick={clearFavorites}
          className="text-gray-500 hover:text-red-500"
          title="Clear all favorites"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={copyFilenames}
          className={`flex-1 px-3 py-2 rounded text-sm flex items-center justify-center ${
            copied 
              ? 'bg-green-500 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } transition-colors`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? 'Copied!' : 'Copy Filenames'}
        </button>
      </div>
    </div>
  );
};

export default FavoritesPanel;