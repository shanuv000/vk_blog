import React, { useState, useEffect } from "react";
import TwitterEmbed from "./TwitterEmbed";
import TweetEmbedder from "./TweetEmbedder";
import { SocialSharing } from "./SocialSharing";

/**
 * Debug component to test and troubleshoot Twitter embed issues
 */
const TwitterEmbedDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({
    blockquotes: 0,
    processedEmbeds: 0,
    twitterWidgetsLoaded: false,
    errors: []
  });

  const [testTweetId] = useState("1790555395041472948");

  // Mock post for social sharing test
  const mockPost = {
    title: "Twitter Embed Debug Test",
    slug: "twitter-embed-debug",
    excerpt: "Testing Twitter embed functionality and responsiveness",
    featuredImage: {
      url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop"
    }
  };

  useEffect(() => {
    // Monitor DOM changes and Twitter widget loading
    const checkStatus = () => {
      const blockquotes = document.querySelectorAll("blockquote");
      const processedEmbeds = document.querySelectorAll("[data-embed-processed]");
      const twitterWidgetsLoaded = !!(window.twttr && window.twttr.widgets);

      setDebugInfo({
        blockquotes: blockquotes.length,
        processedEmbeds: processedEmbeds.length,
        twitterWidgetsLoaded,
        errors: []
      });
    };

    // Initial check
    checkStatus();

    // Check periodically
    const interval = setInterval(checkStatus, 2000);

    // Listen for custom events from TweetEmbedder
    const handleTweetEmbedFound = (event) => {
      if (process.env.NODE_ENV === 'development') {

        if (process.env.NODE_ENV === 'development') {


          console.log("TweetEmbedFound event:", event.detail);


        }

      }
      checkStatus();
    };

    document.addEventListener("tweetEmbedFound", handleTweetEmbedFound);

    return () => {
      clearInterval(interval);
      document.removeEventListener("tweetEmbedFound", handleTweetEmbedFound);
    };
  }, []);

  const addTestBlockquote = () => {
    const container = document.getElementById("test-content");
    if (container) {
      const blockquote = document.createElement("blockquote");
      blockquote.className = "border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4";
      blockquote.textContent = testTweetId;
      container.appendChild(blockquote);
    }
  };

  const clearTestContent = () => {
    const container = document.getElementById("test-content");
    if (container) {
      container.innerHTML = "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold mb-6 text-center">Twitter Embed Debugger</h1>

      {/* Debug Status */}
      <div className="bg-gray-100 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3">Debug Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-white p-3 rounded">
            <div className="font-medium">Blockquotes</div>
            <div className="text-2xl font-bold text-blue-600">{debugInfo.blockquotes}</div>
          </div>
          <div className="bg-white p-3 rounded">
            <div className="font-medium">Processed</div>
            <div className="text-2xl font-bold text-green-600">{debugInfo.processedEmbeds}</div>
          </div>
          <div className="bg-white p-3 rounded">
            <div className="font-medium">Twitter Widgets</div>
            <div className={`text-2xl font-bold ${debugInfo.twitterWidgetsLoaded ? 'text-green-600' : 'text-red-600'}`}>
              {debugInfo.twitterWidgetsLoaded ? '✓' : '✗'}
            </div>
          </div>
          <div className="bg-white p-3 rounded">
            <div className="font-medium">Screen Width</div>
            <div className="text-lg font-bold text-purple-600">
              {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}px
            </div>
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3">Test Controls</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={addTestBlockquote}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Add Test Blockquote
          </button>
          <button
            onClick={clearTestContent}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Clear Test Content
          </button>
        </div>
      </div>

      {/* Direct TwitterEmbed Test */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Direct TwitterEmbed Component</h2>
        <div className="border border-gray-200 rounded-lg p-4">
          <TwitterEmbed tweetId={testTweetId} />
        </div>
      </div>

      {/* Social Sharing Test */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Social Sharing Component</h2>
        <SocialSharing post={mockPost} />
      </div>

      {/* Test Content Area */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Test Content Area</h2>
        <div 
          id="test-content" 
          className="border border-gray-200 rounded-lg p-4 min-h-[200px] bg-gray-50"
        >
          <p className="text-gray-500 text-center">
            Use the "Add Test Blockquote" button to add blockquotes that should be converted to Twitter embeds.
          </p>
        </div>
      </div>

      {/* Pre-existing Blockquote Test */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Pre-existing Blockquote Test</h2>
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="mb-4">This blockquote should be automatically converted to a Twitter embed:</p>
          <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">
            {testTweetId}
          </blockquote>
        </div>
      </div>

      {/* Responsive Test Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Responsive Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium mb-2">Mobile View (< 640px)</h3>
            <div className="text-sm text-gray-600">
              Resize your browser to test mobile responsiveness
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium mb-2">Desktop View (≥ 1024px)</h3>
            <div className="text-sm text-gray-600">
              Embeds should be centered with max-width of 550px
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Testing Instructions</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Check that the direct TwitterEmbed component loads properly</li>
          <li>Verify that pre-existing blockquotes are converted to Twitter embeds</li>
          <li>Test adding new blockquotes using the "Add Test Blockquote" button</li>
          <li>Resize the browser window to test responsive behavior</li>
          <li>Check that social sharing buttons are touch-friendly on mobile</li>
          <li>Verify that Twitter widgets script loads (check debug status)</li>
        </ol>
      </div>

      {/* Include TweetEmbedder */}
      <TweetEmbedder />
    </div>
  );
};

export default TwitterEmbedDebugger;
