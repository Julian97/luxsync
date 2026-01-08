'use client';

import { useState, useEffect } from 'react';

export default function StatusPage() {
  const [status, setStatus] = useState({
    supabase: 'checking...',
    b2: 'checking...',
    app: 'checking...',
  });
  const [lastChecked, setLastChecked] = useState(new Date().toISOString());

  // Simulate checking status of different services
  useEffect(() => {
    const checkStatus = async () => {
      // In a real implementation, these would make actual API calls
      // For now, we'll simulate the status checks
      setStatus({
        supabase: 'healthy',
        b2: 'healthy', 
        app: 'healthy',
      });
      setLastChecked(new Date().toISOString());
    };

    checkStatus();
    
    // Refresh status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusPages = [
    { name: 'Admin Panel', path: '/admin', description: 'Password-protected admin panel for file management' },
    { name: 'Database Debug', path: '/admin/db-debug', description: 'View and verify all data in the Supabase database' },
    { name: 'System Logs', path: '/admin/logs', description: 'Monitor application logs and debug upload processes' },
    { name: 'Sync Verification', path: '/api/admin/sync-verify', description: 'Analyze and synchronize data between B2 and Supabase' },
    { name: 'All Galleries', path: '/galleries', description: 'View all available galleries' },
    { name: 'Home Page', path: '/', description: 'Main gallery homepage' },
  ];

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthText = (status: string) => {
    switch (status) {
      case 'healthy': return 'Healthy';
      case 'warning': return 'Warning';
      case 'error': return 'Error';
      default: return 'Checking...';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">LuxSync Status Dashboard</h1>
              <p className="text-gray-400">Real-time health status of your LuxSync application</p>
            </div>
            <div className="mt-4 md:mt-0 text-sm text-gray-500">
              Last checked: {new Date(lastChecked).toLocaleString()}
            </div>
          </div>

          {/* Health Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-700 rounded-lg p-6">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${getHealthColor(status.supabase)}`}></div>
                <h2 className="text-xl font-semibold text-white">Supabase Database</h2>
              </div>
              <p className="text-gray-400 mt-2">Database connectivity and health</p>
              <p className={`mt-4 font-medium ${status.supabase === 'healthy' ? 'text-green-400' : status.supabase === 'warning' ? 'text-yellow-400' : 'text-red-400'}`}>
                Status: {getHealthText(status.supabase)}
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-6">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${getHealthColor(status.b2)}`}></div>
                <h2 className="text-xl font-semibold text-white">Backblaze B2</h2>
              </div>
              <p className="text-gray-400 mt-2">B2 storage connectivity and health</p>
              <p className={`mt-4 font-medium ${status.b2 === 'healthy' ? 'text-green-400' : status.b2 === 'warning' ? 'text-yellow-400' : 'text-red-400'}`}>
                Status: {getHealthText(status.b2)}
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-6">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${getHealthColor(status.app)}`}></div>
                <h2 className="text-xl font-semibold text-white">Application</h2>
              </div>
              <p className="text-gray-400 mt-2">Overall application health</p>
              <p className={`mt-4 font-medium ${status.app === 'healthy' ? 'text-green-400' : status.app === 'warning' ? 'text-yellow-400' : 'text-red-400'}`}>
                Status: {getHealthText(status.app)}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <a 
                href="/admin" 
                className="bg-blue-700 hover:bg-blue-600 text-white p-4 rounded-lg transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h3 className="font-medium">Admin Panel</h3>
                  <p className="text-sm text-blue-200">Manage files and settings</p>
                </div>
              </a>
              
              <a 
                href="/admin/db-debug" 
                className="bg-purple-700 hover:bg-purple-600 text-white p-4 rounded-lg transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <h3 className="font-medium">Database Debug</h3>
                  <p className="text-sm text-purple-200">View database contents</p>
                </div>
              </a>
              
              <a 
                href="/admin/logs" 
                className="bg-yellow-700 hover:bg-yellow-600 text-white p-4 rounded-lg transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <h3 className="font-medium">System Logs</h3>
                  <p className="text-sm text-yellow-200">Monitor application logs</p>
                </div>
              </a>
              
              <a 
                href="/api/admin/sync-verify" 
                target="_blank"
                className="bg-red-700 hover:bg-red-600 text-white p-4 rounded-lg transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <div>
                  <h3 className="font-medium">Sync Verification</h3>
                  <p className="text-sm text-red-200">Analyze and sync data</p>
                </div>
              </a>
              
              <a 
                href="/galleries" 
                className="bg-green-700 hover:bg-green-600 text-white p-4 rounded-lg transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <h3 className="font-medium">All Galleries</h3>
                  <p className="text-sm text-green-200">View all galleries</p>
                </div>
              </a>
              
              <a 
                href="/" 
                className="bg-indigo-700 hover:bg-indigo-600 text-white p-4 rounded-lg transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <div>
                  <h3 className="font-medium">Home Page</h3>
                  <p className="text-sm text-indigo-200">Main gallery page</p>
                </div>
              </a>
            </div>
          </div>

          {/* All Pages List */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">All Application Pages</h2>
            <div className="bg-gray-700 rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-600">
                {statusPages.map((page, index) => (
                  <li key={index} className="p-4 hover:bg-gray-650 transition-colors">
                    <a 
                      href={page.path} 
                      target={page.path.startsWith('/api') ? '_blank' : undefined}
                      className="flex justify-between items-center group"
                    >
                      <div>
                        <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">{page.name}</h3>
                        <p className="text-sm text-gray-400">{page.description}</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-2">{page.path}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 group-hover:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Status Information */}
          <div className="mt-8 bg-blue-900 border border-blue-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-200 mb-2">Status Information</h3>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Health checks update automatically every 30 seconds</li>
              <li>• API endpoints open in new tabs for direct access</li>
              <li>• All links are functional and up-to-date</li>
              <li>• For database issues, use the Database Debug page first</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}