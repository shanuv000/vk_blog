import React, { useState, useEffect } from "react";
import TwitterEmbed from "./TwitterEmbed";
import { SocialSharing } from "./SocialSharing";
import TweetEmbedder from "./TweetEmbedder";

/**
 * Test component to verify responsive behavior of social media embeds
 * This component helps test embeds across different screen sizes
 */
const ResponsiveTestPage = () => {
  const [screenSize, setScreenSize] = useState("unknown");
  const [windowWidth, setWindowWidth] = useState(0);

  // Mock post data for testing
  const mockPost = {
    title: "Testing Responsive Social Media Embeds",
    slug: "responsive-social-media-test",
    excerpt: "This is a test post to verify that social media embeds work properly across all device sizes.",
    featuredImage: {
      url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop"
    },
    author: {
      name: "Test Author"
    },
    createdAt: new Date().toISOString(),
    categories: [
      { name: "Technology", slug: "technology" },
      { name: "Testing", slug: "testing" }
    ]
  };

  // Track screen size changes
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      
      if (width < 640) {
        setScreenSize("Mobile (< 640px)");
      } else if (width < 768) {
        setScreenSize("Mobile Large (640px - 767px)");
      } else if (width < 1024) {
        setScreenSize("Tablet (768px - 1023px)");
      } else if (width < 1280) {
        setScreenSize("Desktop (1024px - 1279px)");
      } else {
        setScreenSize("Large Desktop (≥ 1280px)");
      }
    };

    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);
    
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Responsive Social Media Embeds Test
          </h1>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg inline-block">
            <p className="text-sm sm:text-base">
              Current Screen: <strong>{screenSize}</strong> ({windowWidth}px)
            </p>
          </div>
        </header>

        {/* Device Size Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-8">
          <div className={`p-3 rounded-lg text-center text-sm ${windowWidth < 640 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            <div className="font-semibold">Mobile</div>
            <div>&lt; 640px</div>
          </div>
          <div className={`p-3 rounded-lg text-center text-sm ${windowWidth >= 640 && windowWidth < 768 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            <div className="font-semibold">Mobile L</div>
            <div>640-767px</div>
          </div>
          <div className={`p-3 rounded-lg text-center text-sm ${windowWidth >= 768 && windowWidth < 1024 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            <div className="font-semibold">Tablet</div>
            <div>768-1023px</div>
          </div>
          <div className={`p-3 rounded-lg text-center text-sm ${windowWidth >= 1024 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            <div className="font-semibold">Desktop</div>
            <div>≥ 1024px</div>
          </div>
        </div>

        {/* Social Sharing Test */}
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
            Social Sharing Component
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <SocialSharing post={mockPost} />
          </div>
        </section>

        {/* Twitter Embed Tests */}
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
            Twitter Embed Tests
          </h2>
          
          {/* Direct Twitter Embed */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              Direct TwitterEmbed Component
            </h3>
            <TwitterEmbed tweetId="1790555395041472948" />
          </div>

          {/* Blockquote Tweet Test */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              Blockquote Tweet (Auto-detected by TweetEmbedder)
            </h3>
            <div className="prose max-w-none">
              <p>Here's a tweet embedded via blockquote:</p>
              <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600">
                1790555395041472948
              </blockquote>
              <p>The TweetEmbedder should automatically convert this to a Twitter embed.</p>
            </div>
          </div>
        </section>

        {/* Responsive Behavior Notes */}
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
            Responsive Behavior Checklist
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex-shrink-0 mt-0.5"></div>
                <div>
                  <strong>Mobile (< 640px):</strong> Smaller buttons, compact spacing, touch-friendly targets
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex-shrink-0 mt-0.5"></div>
                <div>
                  <strong>Tablet (640px - 1023px):</strong> Medium-sized elements, balanced spacing
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex-shrink-0 mt-0.5"></div>
                <div>
                  <strong>Desktop (≥ 1024px):</strong> Full-sized elements, optimal spacing
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex-shrink-0 mt-0.5"></div>
                <div>
                  <strong>Twitter Embeds:</strong> Max width 550px, centered, responsive iframe
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex-shrink-0 mt-0.5"></div>
                <div>
                  <strong>Social Buttons:</strong> Touch-friendly (44px minimum), proper spacing
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testing Instructions */}
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
            Testing Instructions
          </h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
            <ol className="list-decimal list-inside space-y-2 text-sm sm:text-base">
              <li>Resize your browser window to test different breakpoints</li>
              <li>Test on actual mobile devices (iOS Safari, Android Chrome)</li>
              <li>Verify touch targets are at least 44px for mobile accessibility</li>
              <li>Check that Twitter embeds load properly and are responsive</li>
              <li>Ensure social sharing buttons work on all platforms</li>
              <li>Test in both portrait and landscape orientations on mobile</li>
            </ol>
          </div>
        </section>

        {/* Include TweetEmbedder for auto-detection */}
        <TweetEmbedder />
      </div>
    </div>
  );
};

export default ResponsiveTestPage;
