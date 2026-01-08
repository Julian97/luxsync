'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/server';

export default function DbDebugPage() {
  const [galleries, setGalleries] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      
      // Fetch galleries
      const { data: galleriesData, error: galleriesError } = await supabase
        .from('galleries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (galleriesError) throw galleriesError;
      setGalleries(galleriesData || []);
      
      // Fetch photos
      const { data: photosData, error: photosError } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (photosError) throw photosError;
      setPhotos(photosData || []);
      
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (usersError) throw usersError;
      setUsers(usersData || []);
      
    } catch (err: any) {
      setError(err.message || 'Error fetching data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white">Loading database data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Database Debug Tool</h1>
            <button
              onClick={handleRefresh}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Refresh Data
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-800 text-red-200 rounded-md">
              Error: {error}
            </div>
          )}

          {/* Gallery Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-700 p-4 rounded-md">
              <h2 className="text-lg font-semibold text-white">Galleries</h2>
              <p className="text-2xl font-bold text-blue-400">{galleries.length}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-md">
              <h2 className="text-lg font-semibold text-white">Photos</h2>
              <p className="text-2xl font-bold text-green-400">{photos.length}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-md">
              <h2 className="text-lg font-semibold text-white">Users</h2>
              <p className="text-2xl font-bold text-yellow-400">{users.length}</p>
            </div>
          </div>

          {/* Galleries Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span>Galleries ({galleries.length})</span>
              <button 
                onClick={() => document.getElementById('galleries-content')?.classList.toggle('hidden')}
                className="ml-4 text-sm bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded"
              >
                Toggle
              </button>
            </h2>
            <div id="galleries-content" className="overflow-x-auto">
              <table className="min-w-full bg-gray-700 rounded-md">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="py-2 px-4 text-left text-gray-300">ID</th>
                    <th className="py-2 px-4 text-left text-gray-300">Title</th>
                    <th className="py-2 px-4 text-left text-gray-300">Folder Name</th>
                    <th className="py-2 px-4 text-left text-gray-300">Event Date</th>
                    <th className="py-2 px-4 text-left text-gray-300">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {galleries.length > 0 ? (
                    galleries.map((gallery, index) => (
                      <tr key={index} className="border-b border-gray-600 hover:bg-gray-650">
                        <td className="py-2 px-4 text-gray-300 font-mono text-sm">{gallery.id}</td>
                        <td className="py-2 px-4 text-gray-300">{gallery.title}</td>
                        <td className="py-2 px-4 text-gray-300 font-mono">{gallery.folder_name}</td>
                        <td className="py-2 px-4 text-gray-300">{gallery.event_date}</td>
                        <td className="py-2 px-4 text-gray-300 text-sm">{new Date(gallery.created_at).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 px-4 text-center text-gray-400">No galleries found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Photos Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span>Photos ({photos.length})</span>
              <button 
                onClick={() => document.getElementById('photos-content')?.classList.toggle('hidden')}
                className="ml-4 text-sm bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded"
              >
                Toggle
              </button>
            </h2>
            <div id="photos-content" className="overflow-x-auto">
              <table className="min-w-full bg-gray-700 rounded-md">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="py-2 px-4 text-left text-gray-300">ID</th>
                    <th className="py-2 px-4 text-left text-gray-300">Gallery ID</th>
                    <th className="py-2 px-4 text-left text-gray-300">B2 File Key</th>
                    <th className="py-2 px-4 text-left text-gray-300">Public URL</th>
                    <th className="py-2 px-4 text-left text-gray-300">Dimensions</th>
                    <th className="py-2 px-4 text-left text-gray-300">User Tag ID</th>
                    <th className="py-2 px-4 text-left text-gray-300">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {photos.length > 0 ? (
                    photos.map((photo, index) => (
                      <tr key={index} className="border-b border-gray-600 hover:bg-gray-650">
                        <td className="py-2 px-4 text-gray-300 font-mono text-sm">{photo.id}</td>
                        <td className="py-2 px-4 text-gray-300 font-mono text-sm">{photo.gallery_id}</td>
                        <td className="py-2 px-4 text-gray-300 font-mono text-sm max-w-xs truncate">{photo.b2_file_key}</td>
                        <td className="py-2 px-4 text-gray-300">
                          <a href={photo.public_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                            View
                          </a>
                        </td>
                        <td className="py-2 px-4 text-gray-300">{photo.width}x{photo.height}</td>
                        <td className="py-2 px-4 text-gray-300 font-mono text-sm">{photo.user_tag_id || '-'}</td>
                        <td className="py-2 px-4 text-gray-300 text-sm">{new Date(photo.created_at).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-4 px-4 text-center text-gray-400">No photos found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Users Section */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span>Users ({users.length})</span>
              <button 
                onClick={() => document.getElementById('users-content')?.classList.toggle('hidden')}
                className="ml-4 text-sm bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded"
              >
                Toggle
              </button>
            </h2>
            <div id="users-content" className="overflow-x-auto">
              <table className="min-w-full bg-gray-700 rounded-md">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="py-2 px-4 text-left text-gray-300">ID</th>
                    <th className="py-2 px-4 text-left text-gray-300">Handle</th>
                    <th className="py-2 px-4 text-left text-gray-300">Display Name</th>
                    <th className="py-2 px-4 text-left text-gray-300">Instagram</th>
                    <th className="py-2 px-4 text-left text-gray-300">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user, index) => (
                      <tr key={index} className="border-b border-gray-600 hover:bg-gray-650">
                        <td className="py-2 px-4 text-gray-300 font-mono text-sm">{user.id}</td>
                        <td className="py-2 px-4 text-gray-300">{user.handle}</td>
                        <td className="py-2 px-4 text-gray-300">{user.display_name}</td>
                        <td className="py-2 px-4 text-gray-300">{user.instagram || '-'}</td>
                        <td className="py-2 px-4 text-gray-300 text-sm">{new Date(user.created_at).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 px-4 text-center text-gray-400">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}