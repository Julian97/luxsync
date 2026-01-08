'use client';

import { useState, useEffect } from 'react';

export default function LogsPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [logLevel, setLogLevel] = useState('all');
  const [followLogs, setFollowLogs] = useState(true);

  // In a real implementation, this would connect to a logging service
  // For now, we'll simulate with console logs and a basic log collector
  useEffect(() => {
    // This is a simulation - in a real app, you'd connect to actual log sources
    const simulatedLogs = [
      "2026-01-09 00:15:23 - Starting upload request",
      "2026-01-09 00:15:24 - Form data parsed successfully",
      "2026-01-09 00:15:24 - Processing 3 files for upload to path: 2026-01-09 Test Event/username",
      "2026-01-09 00:15:25 - Found existing gallery: { id: '1', title: '2026-01-09 Test Event', folder_name: '2026-01-09 Test Event' }",
      "2026-01-09 00:15:26 - Found existing user: { id: '1', handle: 'username', display_name: 'username' }",
      "2026-01-09 00:15:27 - Inserting photo record for file: photo1.jpg, gallery_id: 1, user_tag_id: 1",
      "2026-01-09 00:15:28 - Successfully inserted photo record: { id: 'uuid', gallery_id: '1', b2_file_key: 'B2 LuxSync/2026-01-09 Test Event/username/uuid.jpg' }",
      "2026-01-09 00:15:29 - Upload completed. 3 files processed.",
      "2026-01-09 00:10:15 - Gallery sync started",
      "2026-01-09 00:10:16 - Fetched 31 objects from B2",
      "2026-01-09 00:10:17 - Detected gallery: 2026-01-08 Test Event",
      "2026-01-09 00:10:18 - Detected gallery: 2026_01_05 Initial test",
      "2026-01-09 00:10:19 - Sync completed: 2 galleries, 20 photos"
    ];

    setLogs(simulatedLogs);
  }, []);

  const filteredLogs = logs.filter(log => {
    if (logLevel === 'all') return true;
    if (logLevel === 'error' && log.includes('Error')) return true;
    if (logLevel === 'warn' && (log.toLowerCase().includes('warn') || log.toLowerCase().includes('error'))) return true;
    if (logLevel === 'info' && !log.toLowerCase().includes('error') && !log.toLowerCase().includes('warn')) return true;
    return false;
  });

  const handleRefresh = () => {
    // In a real app, this would fetch fresh logs
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-white">System Logs</h1>
            <div className="flex flex-wrap gap-3">
              <select
                value={logLevel}
                onChange={(e) => setLogLevel(e.target.value)}
                className="bg-gray-700 text-white px-3 py-2 rounded-md"
              >
                <option value="all">All Logs</option>
                <option value="info">Info Only</option>
                <option value="warn">Warnings & Errors</option>
                <option value="error">Errors Only</option>
              </select>
              <button
                onClick={handleRefresh}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Refresh
              </button>
              <label className="flex items-center text-gray-300">
                <input
                  type="checkbox"
                  checked={followLogs}
                  onChange={(e) => setFollowLogs(e.target.checked)}
                  className="mr-2"
                />
                Follow Logs
              </label>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto max-h-[60vh]">
            {filteredLogs.length > 0 ? (
              <div className="space-y-1">
                {filteredLogs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`whitespace-pre-wrap ${
                      log.includes('Error') ? 'text-red-400' : 
                      log.includes('warn') || log.includes('Warn') ? 'text-yellow-400' : 
                      'text-gray-300'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No logs found matching the selected criteria</p>
            )}
          </div>

          <div className="mt-6 bg-blue-900 border border-blue-700 rounded-md p-4">
            <h2 className="text-lg font-semibold text-blue-200 mb-2">Log Analysis Guide</h2>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Look for "Successfully inserted photo record" to confirm DB writes are working</li>
              <li>• Check for "Found existing gallery" or "Successfully created gallery" messages</li>
              <li>• Monitor for any "Error" messages that might indicate DB connection issues</li>
              <li>• Verify that gallery and user creation happens before photo insertion</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}