import React, { useState, useEffect } from "react";
import TwitterEmbed from "./TwitterEmbed";

/**
 * Comprehensive diagnostic panel for debugging GraphQL and Twitter embed issues
 */
const DiagnosticPanel = () => {
  const [diagnostics, setDiagnostics] = useState({
    graphql: {
      recentPosts: { status: "checking", data: null, error: null },
      featuredPosts: { status: "checking", data: null, error: null },
      categories: { status: "checking", data: null, error: null }
    },
    twitter: {
      widgetsLoaded: false,
      embedsProcessed: 0,
      errors: []
    },
    network: {
      online: navigator.onLine,
      connection: null
    }
  });

  const [testTweetId] = useState("1790555395041472948");

  useEffect(() => {
    // Test GraphQL endpoints
    const testGraphQLEndpoints = async () => {
      // Test recent posts
      try {
        const response = await fetch("/api/hygraph-proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query GetRecentPosts {
                posts(orderBy: createdAt_DESC, first: 5) {
                  title
                  featuredImage { url }
                  createdAt
                  slug
                }
              }
            `
          })
        });

        const result = await response.json();
        
        setDiagnostics(prev => ({
          ...prev,
          graphql: {
            ...prev.graphql,
            recentPosts: {
              status: response.ok ? "success" : "error",
              data: result,
              error: response.ok ? null : result.message || "Unknown error"
            }
          }
        }));
      } catch (error) {
        setDiagnostics(prev => ({
          ...prev,
          graphql: {
            ...prev.graphql,
            recentPosts: {
              status: "error",
              data: null,
              error: error.message
            }
          }
        }));
      }

      // Test featured posts
      try {
        const response = await fetch("/api/hygraph-proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query GetFeaturedPosts {
                posts(where: { featuredpost: true }, first: 3, orderBy: createdAt_DESC) {
                  title
                  slug
                  createdAt
                }
              }
            `
          })
        });

        const result = await response.json();
        
        setDiagnostics(prev => ({
          ...prev,
          graphql: {
            ...prev.graphql,
            featuredPosts: {
              status: response.ok ? "success" : "error",
              data: result,
              error: response.ok ? null : result.message || "Unknown error"
            }
          }
        }));
      } catch (error) {
        setDiagnostics(prev => ({
          ...prev,
          graphql: {
            ...prev.graphql,
            featuredPosts: {
              status: "error",
              data: null,
              error: error.message
            }
          }
        }));
      }
    };

    // Monitor Twitter widgets
    const checkTwitterWidgets = () => {
      const widgetsLoaded = !!(window.twttr && window.twttr.widgets);
      const embedsProcessed = document.querySelectorAll('[data-embed-processed="true"]').length;
      
      setDiagnostics(prev => ({
        ...prev,
        twitter: {
          ...prev.twitter,
          widgetsLoaded,
          embedsProcessed
        }
      }));
    };

    // Monitor network status
    const updateNetworkStatus = () => {
      setDiagnostics(prev => ({
        ...prev,
        network: {
          online: navigator.onLine,
          connection: navigator.connection || null
        }
      }));
    };

    // Run initial tests
    testGraphQLEndpoints();
    checkTwitterWidgets();
    updateNetworkStatus();

    // Set up periodic checks
    const graphqlInterval = setInterval(testGraphQLEndpoints, 30000); // Every 30 seconds
    const twitterInterval = setInterval(checkTwitterWidgets, 5000); // Every 5 seconds

    // Listen for network changes
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      clearInterval(graphqlInterval);
      clearInterval(twitterInterval);
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "success": return "text-green-600 bg-green-100";
      case "error": return "text-red-600 bg-red-100";
      case "checking": return "text-yellow-600 bg-yellow-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success": return "✅";
      case "error": return "❌";
      case "checking": return "⏳";
      default: return "❓";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white">
      <h1 className="text-2xl font-bold mb-6 text-center">System Diagnostics Panel</h1>

      {/* Network Status */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Network Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="font-medium">Connection</div>
            <div className={`text-lg ${diagnostics.network.online ? 'text-green-600' : 'text-red-600'}`}>
              {diagnostics.network.online ? '🟢 Online' : '🔴 Offline'}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">Type</div>
            <div className="text-sm">
              {diagnostics.network.connection?.effectiveType || 'Unknown'}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">Downlink</div>
            <div className="text-sm">
              {diagnostics.network.connection?.downlink ? `${diagnostics.network.connection.downlink} Mbps` : 'Unknown'}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">RTT</div>
            <div className="text-sm">
              {diagnostics.network.connection?.rtt ? `${diagnostics.network.connection.rtt}ms` : 'Unknown'}
            </div>
          </div>
        </div>
      </div>

      {/* GraphQL Status */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-3">GraphQL Endpoints</h2>
        <div className="space-y-3">
          {Object.entries(diagnostics.graphql).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                <span className="text-lg">{getStatusIcon(value.status)}</span>
                <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(value.status)}`}>
                  {value.status}
                </span>
                {value.data && value.data.posts && (
                  <span className="text-sm text-gray-600">
                    {value.data.posts.length} items
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Twitter Embed Status */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Twitter Embed Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-3 border rounded">
            <div className="font-medium">Widgets Script</div>
            <div className={`text-lg ${diagnostics.twitter.widgetsLoaded ? 'text-green-600' : 'text-red-600'}`}>
              {diagnostics.twitter.widgetsLoaded ? '✅ Loaded' : '❌ Not Loaded'}
            </div>
          </div>
          <div className="text-center p-3 border rounded">
            <div className="font-medium">Processed Embeds</div>
            <div className="text-lg text-blue-600">
              {diagnostics.twitter.embedsProcessed}
            </div>
          </div>
          <div className="text-center p-3 border rounded">
            <div className="font-medium">Errors</div>
            <div className="text-lg text-red-600">
              {diagnostics.twitter.errors.length}
            </div>
          </div>
        </div>
      </div>

      {/* Test Twitter Embed */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Test Twitter Embed</h2>
        <TwitterEmbed tweetId={testTweetId} />
      </div>

      {/* Raw Data Display */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Raw Diagnostic Data</h2>
        <details className="cursor-pointer">
          <summary className="font-medium text-blue-600 hover:text-blue-800">
            Click to view raw data
          </summary>
          <pre className="mt-3 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(diagnostics, null, 2)}
          </pre>
        </details>
      </div>

      {/* Console Logs */}
      <div className="p-4 border rounded-lg bg-yellow-50">
        <h2 className="text-lg font-semibold mb-3">Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Open browser developer tools (F12) and check the Console tab</li>
          <li>Look for any error messages related to GraphQL or Twitter embeds</li>
          <li>Check the Network tab for failed requests</li>
          <li>Verify that all status indicators above show green/success</li>
          <li>Test the Twitter embed above to ensure it loads properly</li>
        </ol>
      </div>
    </div>
  );
};

export default DiagnosticPanel;
