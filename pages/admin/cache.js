import { useState, useEffect } from 'react';
import Head from 'next/head';
import useCacheMonitor from '../../hooks/useCacheMonitor';
import { clearCache } from '../../services/hygraph';

const CacheMonitorPage = () => {
  const [isClient, setIsClient] = useState(false);
  const { stats, loading, error, lastUpdated, refresh, prune } = useCacheMonitor({
    autoRefresh: true,
    refreshInterval: 10000, // 10 seconds
  });

  // Handle clear cache action
  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear the entire cache?')) {
      const clearedCount = clearCache();
      refresh();
      alert(`Cache cleared. ${clearedCount} entries removed.`);
    }
  };

  // Handle prune cache action
  const handlePruneCache = async () => {
    const prunedCount = await prune();
    alert(`Cache pruned. ${prunedCount} expired entries removed.`);
  };

  // Format bytes to human-readable format
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format time to human-readable format
  const formatTime = (ms) => {
    if (!ms) return 'N/A';
    
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds} seconds`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours`;
    
    const days = Math.floor(hours / 24);
    return `${days} days`;
  };

  // Use useEffect to set isClient to true after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Cache Monitor - Admin</title>
      </Head>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cache Monitor</h1>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={refresh}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh Stats'}
          </button>
          
          <button
            onClick={handlePruneCache}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md shadow-sm"
          >
            Prune Expired Entries
          </button>
          
          <button
            onClick={handleClearCache}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-sm"
          >
            Clear All Cache
          </button>
        </div>
        
        {/* Last updated */}
        {lastUpdated && (
          <p className="text-sm text-gray-500 mb-6">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
        
        {/* Stats display */}
        {isClient && loading && !stats && (
          <div className="text-center py-12">
            <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Loading cache statistics...</p>
          </div>
        )}
        
        {isClient && stats && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-b border-gray-200">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-800 mb-2">Total Entries</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.totalEntries}</p>
                <div className="mt-2 text-sm text-blue-500">
                  <span className="font-medium">{stats.validEntries}</span> valid, 
                  <span className="font-medium ml-1">{stats.expiredEntries}</span> expired
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-800 mb-2">Entry Types</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-green-600">Images:</span>
                    <span className="font-medium text-green-700">{stats.imageEntries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Categories:</span>
                    <span className="font-medium text-green-700">{stats.categoryEntries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Other:</span>
                    <span className="font-medium text-green-700">{stats.otherEntries}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-purple-800 mb-2">Age Statistics</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-purple-600">Average age:</span>
                    <span className="font-medium text-purple-700">{formatTime(stats.averageAge)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-600">Oldest entry:</span>
                    <span className="font-medium text-purple-700">{formatTime(stats.oldestEntry)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-600">Newest entry:</span>
                    <span className="font-medium text-purple-700">{formatTime(stats.newestEntry)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Cache health indicator */}
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cache Health</h3>
              
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div 
                  className={`h-4 rounded-full ${
                    stats.expiredEntries > stats.validEntries 
                      ? 'bg-red-500' 
                      : stats.expiredEntries > stats.validEntries / 2 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${stats.validEntries / (stats.totalEntries || 1) * 100}%` }}
                ></div>
              </div>
              
              <p className="text-sm text-gray-600">
                {stats.expiredEntries > stats.validEntries 
                  ? '⚠️ Cache health is poor. Consider pruning expired entries.'
                  : stats.expiredEntries > stats.validEntries / 2
                    ? '⚠️ Cache health is moderate. Some entries are expired.'
                    : '✅ Cache health is good. Most entries are valid.'}
              </p>
            </div>
          </div>
        )}
        
        {/* Note */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            <strong>Note:</strong> This page is only accessible to administrators. 
            Cache statistics are calculated on-demand and do not affect site performance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CacheMonitorPage;
