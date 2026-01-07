'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsLoggedIn(true);
      } else {
        setError(data.message || 'Invalid password');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoggedIn) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <button
              onClick={() => {
                // Logout functionality would go here
                window.location.href = '/admin';
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>

          {message && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
              {message}
            </div>
          )}

          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {['upload', 'manage', 'metadata'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {activeTab === 'upload' && <UploadTab />}
          {activeTab === 'manage' && <ManageTab />}
          {activeTab === 'metadata' && <MetadataTab />}
        </div>
      </div>
    </div>
  );
}

function UploadTab() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [folderPath, setFolderPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setMessage('Please select files to upload');
      return;
    }

    setIsLoading(true);
    setMessage('');

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('folderPath', folderPath);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`${result.message}. ${result.processedFiles} files processed.`);
        setFiles(null);
      } else {
        setMessage(result.message || 'Upload failed');
      }
    } catch (error) {
      setMessage('An error occurred during upload');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Target Folder Path (e.g., "2026-01-08 Test Event/username")
        </label>
        <input
          type="text"
          value={folderPath}
          onChange={(e) => setFolderPath(e.target.value)}
          placeholder="B2 LuxSync/"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Files to Upload
        </label>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <button
        onClick={handleUpload}
        disabled={isLoading}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Uploading...' : 'Upload Files'}
      </button>
      
      {message && (
        <div className={`p-3 rounded-md ${message.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
    </div>
  );
}

function ManageTab() {
  const [sourcePath, setSourcePath] = useState('');
  const [targetPath, setTargetPath] = useState('');
  const [action, setAction] = useState<'move' | 'rename' | 'delete'>('move');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAction = async () => {
    if (!sourcePath) {
      setMessage('Please enter a source path');
      return;
    }

    if (action !== 'delete' && !targetPath) {
      setMessage('Please enter a target path');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          sourcePath,
          targetPath: action !== 'delete' ? targetPath : undefined
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message);
      } else {
        setMessage(result.message || 'Action failed');
      }
    } catch (error) {
      setMessage('An error occurred');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Action
        </label>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="move">Move</option>
          <option value="rename">Rename</option>
          <option value="delete">Delete</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Source Path (e.g., "2026-01-08 Test Event/username/photo.jpg")
        </label>
        <input
          type="text"
          value={sourcePath}
          onChange={(e) => setSourcePath(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      {action !== 'delete' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Path (e.g., "2026-01-09 New Event/username/photo.jpg")
          </label>
          <input
            type="text"
            value={targetPath}
            onChange={(e) => setTargetPath(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}
      
      <button
        onClick={handleAction}
        disabled={isLoading}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : action.charAt(0).toUpperCase() + action.slice(1)}
      </button>
      
      {message && (
        <div className={`p-3 rounded-md ${message.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
    </div>
  );
}

function MetadataTab() {
  const [message, setMessage] = useState('');

  const handleSyncMetadata = async () => {
    setMessage('Syncing metadata...');
    
    try {
      const response = await fetch('/api/admin/sync-metadata', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message);
      } else {
        setMessage(result.message || 'Metadata sync failed');
      }
    } catch (error) {
      setMessage('An error occurred during metadata sync');
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-yellow-700">
          This will scan all files in the B2 LuxSync folder and update the Supabase database with metadata
          including filename, dimensions, hash IDs, and file paths.
        </p>
      </div>
      
      <button
        onClick={handleSyncMetadata}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Sync All Metadata
      </button>
      
      {message && (
        <div className={`p-3 rounded-md ${message.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          {message}
        </div>
      )}
    </div>
  );
}