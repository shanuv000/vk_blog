import React, { useState, useEffect } from "react";
import { SocialSharing } from "./SocialSharing";
import TweetEmbedder from "./TweetEmbedder";
import TwitterEmbed from "./TwitterEmbed";

/**
 * Mobile-focused test component to verify container sizes are appropriate
 */
const MobileSizeTest = () => {
  const [screenInfo, setScreenInfo] = useState({
    width: 0,
    height: 0,
    deviceType: "unknown"
  });

  const mockPost = {
    title: "Mobile Size Test - Twitter Embeds",
    slug: "mobile-size-test",
    excerpt: "Testing mobile-optimized container sizes for Twitter embeds",
    featuredImage: {
      url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop"
    }
  };

  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let deviceType = "Desktop";
      if (width < 640) {
        deviceType = "Mobile";
      } else if (width < 1024) {
        deviceType = "Tablet";
      }

      setScreenInfo({ width, height, deviceType });
    };

    updateScreenInfo();
    window.addEventListener("resize", updateScreenInfo);
    
    return () => window.removeEventListener("resize", updateScreenInfo);
  }, []);

  const getContainerInfo = () => {
    if (screenInfo.width < 640) {
      return {
        margins: "12px top/bottom (my-3)",
        padding: "4px horizontal",
        minHeight: "140px (loading), 200px (iframe)",
        buttonSize: "40px × 40px",
        iconSize: "16px"
      };
    } else if (screenInfo.width < 1024) {
      return {
        margins: "16px top/bottom (my-4)",
        padding: "12px horizontal", 
        minHeight: "180px (loading), standard (iframe)",
        buttonSize: "48px × 48px",
        iconSize: "20px"
      };
    } 
      return {
        margins: "24px top/bottom (my-6)",
        padding: "16px horizontal",
        minHeight: "200px (loading), standard (iframe)",
        buttonSize: "48px × 48px", 
        iconSize: "20px"
      };
    
  };

  const containerInfo = getContainerInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header with Screen Info */}
      <div className="sticky top-0 bg-white shadow-sm border-b z-10 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-lg sm:text-xl font-bold mb-2">Mobile Size Test</h1>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs sm:text-sm">
            <div className="bg-blue-100 p-2 rounded text-center">
              <div className="font-medium">Device</div>
              <div className="text-blue-800 font-bold">{screenInfo.deviceType}</div>
            </div>
            <div className="bg-green-100 p-2 rounded text-center">
              <div className="font-medium">Width</div>
              <div className="text-green-800 font-bold">{screenInfo.width}px</div>
            </div>
            <div className="bg-purple-100 p-2 rounded text-center">
              <div className="font-medium">Height</div>
              <div className="text-purple-800 font-bold">{screenInfo.height}px</div>
            </div>
            <div className="bg-orange-100 p-2 rounded text-center">
              <div className="font-medium">Ratio</div>
              <div className="text-orange-800 font-bold">
                {screenInfo.width > screenInfo.height ? "Landscape" : "Portrait"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-2 sm:p-4 md:p-6">
        {/* Container Size Info */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-3">Current Container Specs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div>
              <strong>Margins:</strong> {containerInfo.margins}
            </div>
            <div>
              <strong>Padding:</strong> {containerInfo.padding}
            </div>
            <div>
              <strong>Min Height:</strong> {containerInfo.minHeight}
            </div>
            <div>
              <strong>Button Size:</strong> {containerInfo.buttonSize}
            </div>
          </div>
        </div>

        {/* Size Comparison */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-3">Size Comparison</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-200 rounded flex-shrink-0 flex items-center justify-center text-xs">
                Old
              </div>
              <div className="text-xs sm:text-sm">
                <strong>Before:</strong> 24px margins, 8px padding, 250px min-height
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-200 rounded flex-shrink-0 flex items-center justify-center text-xs">
                New
              </div>
              <div className="text-xs sm:text-sm">
                <strong>After:</strong> {containerInfo.margins}, {containerInfo.padding} padding, {containerInfo.minHeight}
              </div>
            </div>
          </div>
        </div>

        {/* Social Sharing Test */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-3 px-2 sm:px-0">Social Sharing (Mobile Optimized)</h2>
          <SocialSharing post={mockPost} />
        </div>

        {/* Direct Twitter Embed Test */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-3 px-2 sm:px-0">Direct Twitter Embed</h2>
          <div className="bg-white rounded-lg shadow-sm p-2 sm:p-4">
            <TwitterEmbed tweetId="1790555395041472948" />
          </div>
        </div>

        {/* Blockquote Test */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-3 px-2 sm:px-0">Auto-converted Blockquote</h2>
          <div className="bg-white rounded-lg shadow-sm p-2 sm:p-4">
            <p className="text-sm mb-3 text-gray-600">This blockquote should auto-convert:</p>
            <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600">
              1790555395041472948
            </blockquote>
          </div>
        </div>

        {/* Mobile Guidelines */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-3">Mobile Design Guidelines</h2>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0 mt-0.5" />
              <div><strong>Touch Targets:</strong> Minimum 44px for accessibility</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0 mt-0.5" />
              <div><strong>Margins:</strong> Reduced on mobile to save space</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0 mt-0.5" />
              <div><strong>Padding:</strong> Minimal horizontal padding on mobile</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0 mt-0.5" />
              <div><strong>Loading States:</strong> Smaller placeholders on mobile</div>
            </div>
          </div>
        </div>

        {/* Test Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <h2 className="text-base sm:text-lg font-semibold mb-3">Testing Instructions</h2>
          <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm">
            <li>Test on actual mobile devices (iPhone, Android)</li>
            <li>Rotate device to test portrait/landscape</li>
            <li>Check that embeds don't overflow screen width</li>
            <li>Verify touch targets are easy to tap</li>
            <li>Ensure adequate spacing between elements</li>
            <li>Test with slow network to see loading states</li>
          </ol>
        </div>

        {/* Include TweetEmbedder for auto-conversion */}
        <TweetEmbedder />
      </div>
    </div>
  );
};

export default MobileSizeTest;
