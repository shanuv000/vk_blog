import React from "react";
import Head from "next/head";
import CacheTest from "../components/CacheTest";
import { CacheDebugger } from "../lib/cache-debug";
import { enableApolloDebug, getApolloStats } from "../lib/apollo-client";

export default function CacheTestPage() {
  const [stats, setStats] = React.useState(null);

  // Enable Apollo debug mode
  const handleEnableDebug = () => {
    enableApolloDebug();
    // Update stats after enabling debug
    const apolloStats = getApolloStats();
    setStats(apolloStats);
  };

  // Get Apollo cache stats
  const handleGetStats = () => {
    const apolloStats = getApolloStats();
    setStats(apolloStats);
  };

  // Update stats every 5 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && window.APOLLO_DEBUG) {
        const apolloStats = getApolloStats();
        setStats(apolloStats);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <CacheDebugger>
      <div className="container mx-auto px-4 py-8">
        <Head>
          <title>Cache Testing - urTechy Blogs</title>
        </Head>

        <h1 className="text-3xl font-bold mb-6">Cache Testing Page</h1>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Apollo Cache Controls</h2>

          <div className="flex space-x-2 mb-4">
            <button
              onClick={handleEnableDebug}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              Enable Debug Mode
            </button>
            <button
              onClick={handleGetStats}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Refresh Stats
            </button>
          </div>

          {stats && (
            <div className="bg-gray-100 p-3 rounded">
              <h4 className="font-semibold mb-2">Apollo Cache Stats:</h4>
              <p>Cache Size: {stats.cacheSize}</p>
              <p>Total Entries: {stats.entries}</p>
              <p>Root Queries: {stats.rootQueries}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              Apollo Client Cache Test
            </h2>
            <CacheTest />
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-2xl font-semibold mb-4">HTTP Cache Test</h2>
            <p className="mb-4">
              This section tests the HTTP caching headers. Click the buttons
              below to make API requests with different caching settings.
            </p>

            <HttpCacheTest />
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-2xl font-semibold mb-4">Image Cache Test</h2>
            <p className="mb-4">
              This section tests the image caching. The images below should be
              cached by the browser and service worker.
            </p>

            <ImageCacheTest />
          </div>
        </div>
      </div>
    </CacheDebugger>
  );
}

// Component to test HTTP caching
function HttpCacheTest() {
  const [results, setResults] = React.useState([]);

  const makeRequest = async (withCache) => {
    const startTime = performance.now();
    const timestamp = Date.now();

    try {
      const response = await fetch(
        `/api/check-cache?cache=${withCache}&timestamp=${timestamp}`
      );
      const data = await response.json();
      const endTime = performance.now();

      setResults((prev) => [
        {
          time: new Date().toLocaleTimeString(),
          duration: (endTime - startTime).toFixed(2),
          cached: withCache,
          data,
        },
        ...prev,
      ]);
    } catch (error) {
      console.error("Error making request:", error);
    }
  };

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => makeRequest(true)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Request with Cache
        </button>
        <button
          onClick={() => makeRequest(false)}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Request without Cache
        </button>
      </div>

      {results.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Request Results:</h3>
          <div className="bg-gray-100 p-2 rounded text-sm max-h-60 overflow-y-auto">
            {results.map((result, index) => (
              <div key={index} className="mb-2 pb-2 border-b border-gray-200">
                <p>
                  <strong>Time:</strong> {result.time} |
                  <strong>Duration:</strong> {result.duration}ms |
                  <strong>Cache Enabled:</strong> {result.cached ? "Yes" : "No"}
                </p>
                <details>
                  <summary>Response Details</summary>
                  <pre className="text-xs mt-1">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Component to test image caching
function ImageCacheTest() {
  const [refresh, setRefresh] = React.useState(0);

  // Add a timestamp to force reload
  const reloadImages = () => {
    setRefresh(Date.now());
  };

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        <button
          onClick={reloadImages}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Reload Images
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">
            Default Image API (should be cached):
          </h3>
          <img
            src={`/api/default-image?type=featured&t=${refresh}`}
            alt="Default Featured Image"
            className="w-full h-auto rounded"
          />
          <p className="text-xs text-gray-500 mt-1">
            This image is served from your API with long cache headers
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">
            Static Image (should be cached):
          </h3>
          <img
            src={`/iconified/logo4.ico?t=${refresh}`}
            alt="Static Image"
            className="w-full h-auto rounded"
          />
          <p className="text-xs text-gray-500 mt-1">
            This image is a static file served by Next.js
          </p>
        </div>
      </div>
    </div>
  );
}
