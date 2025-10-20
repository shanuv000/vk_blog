import React, { useState, useEffect } from "react";
import SocialMediaEmbedder from "../SocialMediaEmbedder";

/**
 * Mobile-specific test component to verify duplicate prevention
 */
const MobileDuplicateTest = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    width: 0,
    height: 0,
    isMobile: false,
    userAgent: ""
  });

  const [duplicateStats, setDuplicateStats] = useState({
    totalEmbeds: 0,
    uniqueTweetIds: 0,
    duplicateCount: 0,
    mobileProcessed: 0
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width <= 768;
      const userAgent = navigator.userAgent;

      setDeviceInfo({ width, height, isMobile, userAgent });
    };

    const updateDuplicateStats = () => {
      const allEmbeds = document.querySelectorAll('[data-tweet-id]');
      const tweetIds = new Set();
      let duplicateCount = 0;

      allEmbeds.forEach((embed) => {
        const tweetId = embed.getAttribute('data-tweet-id') || 
                       embed.querySelector('[data-tweet-id]')?.getAttribute('data-tweet-id');
        
        if (tweetId) {
          if (tweetIds.has(tweetId)) {
            duplicateCount++;
          } else {
            tweetIds.add(tweetId);
          }
        }
      });

      const mobileProcessed = document.querySelectorAll('[data-mobile-processed]').length;

      setDuplicateStats({
        totalEmbeds: allEmbeds.length,
        uniqueTweetIds: tweetIds.size,
        duplicateCount,
        mobileProcessed
      });
    };

    updateDeviceInfo();
    updateDuplicateStats();

    // Update stats periodically
    const interval = setInterval(() => {
      updateDeviceInfo();
      updateDuplicateStats();
    }, 2000);

    // Listen for resize events
    window.addEventListener('resize', updateDeviceInfo);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateDeviceInfo);
    };
  }, []);

  const simulateMobileResize = () => {
    // Temporarily change viewport to simulate mobile
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=375, initial-scale=1');
      setTimeout(() => {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1');
      }, 3000);
    }
  };

  const forceRefresh = () => {
    // Trigger a re-render by changing content
    const blockquotes = document.querySelectorAll('blockquote');
    blockquotes.forEach((bq, index) => {
      bq.style.border = index % 2 === 0 ? '2px solid blue' : '2px solid red';
      setTimeout(() => {
        bq.style.border = '';
      }, 1000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center">
          Mobile Duplicate Prevention Test
        </h1>

        {/* Device Info Panel */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">Device Information</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <strong>Screen Size:</strong> {deviceInfo.width} × {deviceInfo.height}
            </div>
            <div>
              <strong>Device Type:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                deviceInfo.isMobile ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {deviceInfo.isMobile ? 'Mobile' : 'Desktop'}
              </span>
            </div>
            <div className="col-span-2">
              <strong>User Agent:</strong> 
              <div className="text-xs text-gray-600 mt-1 break-all">
                {deviceInfo.userAgent}
              </div>
            </div>
          </div>
        </div>

        {/* Duplicate Statistics */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">Duplicate Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">{duplicateStats.totalEmbeds}</div>
              <div className="text-xs text-gray-600">Total Embeds</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">{duplicateStats.uniqueTweetIds}</div>
              <div className="text-xs text-gray-600">Unique Tweets</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded">
              <div className="text-2xl font-bold text-red-600">{duplicateStats.duplicateCount}</div>
              <div className="text-xs text-gray-600">Duplicates</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded">
              <div className="text-2xl font-bold text-purple-600">{duplicateStats.mobileProcessed}</div>
              <div className="text-xs text-gray-600">Mobile Processed</div>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">Test Controls</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={simulateMobileResize}
              className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Simulate Mobile Resize
            </button>
            <button
              onClick={forceRefresh}
              className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
            >
              Force Content Refresh
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">Status Indicators</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                duplicateStats.duplicateCount === 0 ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>
                {duplicateStats.duplicateCount === 0 ? 
                  '✅ No duplicates detected' : 
                  `❌ ${duplicateStats.duplicateCount} duplicates found`
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                deviceInfo.isMobile ? 'bg-blue-500' : 'bg-gray-500'
              }`} />
              <span>
                {deviceInfo.isMobile ? 
                  '📱 Mobile mode active - duplicate prevention enabled' : 
                  '🖥️ Desktop mode - standard processing'
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                duplicateStats.totalEmbeds === duplicateStats.uniqueTweetIds ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <span>
                {duplicateStats.totalEmbeds === duplicateStats.uniqueTweetIds ? 
                  '✅ All embeds are unique' : 
                  '⚠️ Some embeds may be duplicated'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Test Content */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">Test Content</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Tweet 1:</h3>
              <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600">
                1963432588611391561
              </blockquote>
            </div>
            <div>
              <h3 className="font-medium mb-2">Tweet 2:</h3>
              <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600">
                1963473315944640925
              </blockquote>
            </div>
            <div>
              <h3 className="font-medium mb-2">Tweet 3:</h3>
              <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600">
                1963296096861786599
              </blockquote>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
          <h2 className="text-lg font-semibold mb-3">Testing Instructions</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Test on actual mobile devices (iPhone, Android)</li>
            <li>Resize browser window to simulate mobile viewport</li>
            <li>Check that "Duplicates" count remains 0</li>
            <li>Use test controls to trigger content changes</li>
            <li>Verify tweets don't appear multiple times</li>
            <li>Check browser console for duplicate prevention logs</li>
          </ol>
        </div>

        {/* Include SocialMediaEmbedder */}
        <SocialMediaEmbedder />
      </div>
    </div>
  );
};

export default MobileDuplicateTest;
