/**
 * Cache Debugging Utility
 * 
 * This utility helps debug and monitor caching across different layers:
 * - Apollo Client cache
 * - Service Worker cache
 * - Browser HTTP cache
 */

import { useApolloClient } from '@apollo/client';

/**
 * Hook to check if Apollo cache contains a specific query
 * @param {Object} query - GraphQL query document
 * @param {Object} variables - Query variables
 * @returns {Object} Cache status information
 */
export function useApolloCacheStatus(query, variables) {
  const client = useApolloClient();
  
  // Check if the query is in Apollo cache
  const isCached = client.readQuery({
    query,
    variables,
    returnPartialData: false,
  }) !== null;
  
  // Get cache extract for debugging
  const cacheExtract = client.extract();
  const cacheSize = JSON.stringify(cacheExtract).length;
  
  return {
    isCached,
    cacheSize: `${Math.round(cacheSize / 1024)} KB`,
    cacheKeys: Object.keys(cacheExtract).length,
  };
}

/**
 * Clear Apollo cache
 */
export function clearApolloCache() {
  const client = useApolloClient();
  return client.clearStore();
}

/**
 * Monitor network requests to check for cache hits
 * @returns {Function} Function to start monitoring
 */
export function monitorCacheHits() {
  // Only run in browser
  if (typeof window === 'undefined') return () => {};
  
  // Create a performance observer to monitor resource timing
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    
    entries.forEach(entry => {
      // Only check for Hygraph API requests
      if (entry.name.includes('hygraph') || entry.name.includes('graphassets')) {
        const transferSize = entry.transferSize || 0;
        const isCacheHit = transferSize === 0 && entry.duration < 30;
        
        console.log(`Resource: ${entry.name.split('/').pop()}`);
        console.log(`Cache hit: ${isCacheHit ? 'YES' : 'NO'}`);
        console.log(`Transfer size: ${transferSize} bytes`);
        console.log(`Duration: ${entry.duration.toFixed(2)}ms`);
        console.log('---');
      }
    });
  });
  
  // Start observing
  observer.observe({ entryTypes: ['resource'] });
  
  // Return disconnect function
  return () => observer.disconnect();
}

/**
 * Check service worker cache status
 * @returns {Promise<Object>} Cache status information
 */
export async function checkServiceWorkerCache() {
  // Only run in browser
  if (typeof window === 'undefined') return { active: false };
  
  // Check if service worker is registered
  const swRegistration = await navigator.serviceWorker.getRegistration();
  
  if (!swRegistration) {
    return { active: false, reason: 'No service worker registered' };
  }
  
  // Get cache names
  const cacheNames = await caches.keys();
  const cacheSizes = {};
  
  // Get size of each cache
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    cacheSizes[name] = keys.length;
  }
  
  return {
    active: true,
    serviceWorkerState: swRegistration.active ? swRegistration.active.state : 'none',
    caches: cacheSizes,
  };
}

/**
 * Add debug headers to fetch requests
 */
export function enableFetchDebug() {
  if (typeof window === 'undefined') return;
  
  const originalFetch = window.fetch;
  
  window.fetch = async function(url, options = {}) {
    const start = performance.now();
    
    // Add cache-control debug header
    options.headers = options.headers || {};
    options.headers['X-Debug-Cache'] = '1';
    
    try {
      const response = await originalFetch(url, options);
      const end = performance.now();
      
      // Log cache status from response headers
      if (url.includes('hygraph') || url.includes('graphassets')) {
        const cacheStatus = response.headers.get('x-cache') || 
                           response.headers.get('cf-cache-status') || 
                           'unknown';
        
        console.log(`[Fetch] ${url.split('/').pop()}`);
        console.log(`Cache status: ${cacheStatus}`);
        console.log(`Duration: ${(end - start).toFixed(2)}ms`);
        console.log('---');
      }
      
      return response;
    } catch (error) {
      console.error(`[Fetch Error] ${url}`, error);
      throw error;
    }
  };
}

/**
 * Simple component to display cache status
 */
export function CacheDebugger({ children }) {
  const [cacheInfo, setCacheInfo] = React.useState(null);
  const [isVisible, setIsVisible] = React.useState(false);
  
  React.useEffect(() => {
    async function getCacheInfo() {
      const swCache = await checkServiceWorkerCache();
      setCacheInfo(swCache);
    }
    
    getCacheInfo();
    const stopMonitoring = monitorCacheHits();
    enableFetchDebug();
    
    return () => {
      stopMonitoring();
    };
  }, []);
  
  if (!isVisible) {
    return (
      <>
        {children}
        <button 
          onClick={() => setIsVisible(true)}
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            zIndex: 9999,
            background: '#FF4500',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Debug Cache
        </button>
      </>
    );
  }
  
  return (
    <>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          zIndex: 9999,
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '15px',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          maxWidth: '300px',
          maxHeight: '400px',
          overflow: 'auto',
          fontSize: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h3 style={{ margin: 0 }}>Cache Debug</h3>
          <button 
            onClick={() => setIsVisible(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            ×
          </button>
        </div>
        
        <h4>Service Worker</h4>
        <pre style={{ fontSize: '10px' }}>
          {JSON.stringify(cacheInfo, null, 2)}
        </pre>
        
        <button
          onClick={clearApolloCache}
          style={{
            background: '#FF4500',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 10px',
            cursor: 'pointer',
            fontSize: '12px',
            marginTop: '10px',
          }}
        >
          Clear Apollo Cache
        </button>
      </div>
    </>
  );
}
