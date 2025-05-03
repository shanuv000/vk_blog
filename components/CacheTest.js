import React, { useState, useEffect } from 'react';
import { useQuery, gql, useApolloClient } from '@apollo/client';
import { useApolloCacheStatus, checkServiceWorkerCache } from '../lib/cache-debug';

// Simple query to test caching
const TEST_QUERY = gql`
  query TestCacheQuery {
    posts(first: 1) {
      title
      slug
    }
  }
`;

export default function CacheTest() {
  const [swCacheInfo, setSwCacheInfo] = useState(null);
  const [fetchTimes, setFetchTimes] = useState([]);
  const client = useApolloClient();
  
  // Execute the query
  const { data, loading, error, refetch } = useQuery(TEST_QUERY, {
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });
  
  // Get cache status
  const cacheStatus = useApolloCacheStatus(TEST_QUERY, {});
  
  // Check service worker cache on mount
  useEffect(() => {
    async function checkCache() {
      const info = await checkServiceWorkerCache();
      setSwCacheInfo(info);
    }
    
    checkCache();
  }, []);
  
  // Handle refetch with timing
  const handleRefetch = async () => {
    const startTime = performance.now();
    await refetch();
    const endTime = performance.now();
    
    setFetchTimes(prev => [
      ...prev, 
      { 
        time: new Date().toLocaleTimeString(),
        duration: (endTime - startTime).toFixed(2),
        fromCache: endTime - startTime < 50 // Rough estimate if from cache
      }
    ]);
  };
  
  // Clear Apollo cache
  const clearCache = () => {
    client.clearStore();
    setFetchTimes([]);
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Cache Testing Tool</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold">Apollo Cache Status:</h3>
        <div className="bg-gray-100 p-2 rounded text-sm">
          <p>Is Cached: {cacheStatus.isCached ? 'Yes ✅' : 'No ❌'}</p>
          <p>Cache Size: {cacheStatus.cacheSize}</p>
          <p>Cache Keys: {cacheStatus.cacheKeys}</p>
        </div>
      </div>
      
      {swCacheInfo && (
        <div className="mb-4">
          <h3 className="font-semibold">Service Worker Cache:</h3>
          <div className="bg-gray-100 p-2 rounded text-sm">
            <p>Active: {swCacheInfo.active ? 'Yes ✅' : 'No ❌'}</p>
            {swCacheInfo.active && (
              <>
                <p>State: {swCacheInfo.serviceWorkerState}</p>
                <p>Caches: {Object.keys(swCacheInfo.caches).length}</p>
                <details>
                  <summary>Cache Details</summary>
                  <pre className="text-xs mt-2">
                    {JSON.stringify(swCacheInfo.caches, null, 2)}
                  </pre>
                </details>
              </>
            )}
          </div>
        </div>
      )}
      
      <div className="mb-4">
        <h3 className="font-semibold">Query Result:</h3>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error.message}</p>
        ) : (
          <div className="bg-gray-100 p-2 rounded text-sm">
            {data?.posts?.length > 0 ? (
              <p>Post: {data.posts[0].title}</p>
            ) : (
              <p>No posts found</p>
            )}
          </div>
        )}
      </div>
      
      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleRefetch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refetch Query
        </button>
        <button
          onClick={clearCache}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Cache
        </button>
      </div>
      
      {fetchTimes.length > 0 && (
        <div>
          <h3 className="font-semibold">Fetch History:</h3>
          <div className="bg-gray-100 p-2 rounded text-sm">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Time</th>
                  <th className="text-left">Duration (ms)</th>
                  <th className="text-left">Source</th>
                </tr>
              </thead>
              <tbody>
                {fetchTimes.map((fetch, index) => (
                  <tr key={index}>
                    <td>{fetch.time}</td>
                    <td>{fetch.duration}</td>
                    <td>{fetch.fromCache ? 'Cache ⚡' : 'Network 🌐'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-500">
        <p>
          <strong>How to use:</strong> Click "Refetch Query" multiple times. If caching is working,
          subsequent fetches should be much faster and marked as coming from cache.
        </p>
      </div>
    </div>
  );
}
