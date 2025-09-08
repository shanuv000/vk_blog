import React, { useState, useEffect } from "react";
import SocialMediaEmbedder from "../SocialMediaEmbedder";

/**
 * Test component to verify embed stability during DOM changes
 */
const EmbedStabilityTest = () => {
  const [content, setContent] = useState("initial");
  const [embedStats, setEmbedStats] = useState({
    persistentEmbeds: 0,
    preservedEmbeds: 0,
    processedBlockquotes: 0,
    socialEmbedIds: 0
  });

  // Monitor embed statistics
  useEffect(() => {
    const updateStats = () => {
      const persistentEmbeds = document.querySelectorAll('[data-persistent-embed="true"]').length;
      const preservedEmbeds = document.querySelectorAll('[data-preserved="true"]').length;
      const processedBlockquotes = document.querySelectorAll('[data-processed="true"]').length;
      const socialEmbedIds = document.querySelectorAll('[data-social-embed-id]').length;

      setEmbedStats({
        persistentEmbeds,
        preservedEmbeds,
        processedBlockquotes,
        socialEmbedIds
      });
    };

    // Update stats periodically
    const interval = setInterval(updateStats, 1000);
    updateStats(); // Initial update

    return () => clearInterval(interval);
  }, []);

  // Simulate DOM changes that previously caused issues
  const triggerDOMChange = () => {
    setContent(prev => prev === "initial" ? "changed" : "initial");
  };

  const addNewContent = () => {
    const newContent = document.createElement("div");
    newContent.innerHTML = `
      <h3>Dynamically Added Content</h3>
      <blockquote>1963432588611391561</blockquote>
      <p>This content was added dynamically to test embed stability.</p>
    `;
    
    const container = document.getElementById("dynamic-content");
    if (container) {
      container.appendChild(newContent);
    }
  };

  const clearDynamicContent = () => {
    const container = document.getElementById("dynamic-content");
    if (container) {
      container.innerHTML = "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-2xl font-bold mb-6">Embed Stability Test</h1>

      {/* Statistics Panel */}
      <div className="bg-gray-100 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Embed Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white rounded">
            <div className="text-2xl font-bold text-blue-600">{embedStats.persistentEmbeds}</div>
            <div className="text-sm text-gray-600">Persistent Embeds</div>
          </div>
          <div className="text-center p-3 bg-white rounded">
            <div className="text-2xl font-bold text-green-600">{embedStats.preservedEmbeds}</div>
            <div className="text-sm text-gray-600">Preserved Embeds</div>
          </div>
          <div className="text-center p-3 bg-white rounded">
            <div className="text-2xl font-bold text-purple-600">{embedStats.processedBlockquotes}</div>
            <div className="text-sm text-gray-600">Processed Blockquotes</div>
          </div>
          <div className="text-center p-3 bg-white rounded">
            <div className="text-2xl font-bold text-orange-600">{embedStats.socialEmbedIds}</div>
            <div className="text-sm text-gray-600">Social Embed IDs</div>
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Test Controls</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={triggerDOMChange}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Trigger DOM Change
          </button>
          <button
            onClick={addNewContent}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Add Dynamic Content
          </button>
          <button
            onClick={clearDynamicContent}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Clear Dynamic Content
          </button>
        </div>
      </div>

      {/* Content that changes to test stability */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Content State: {content}</h2>
        <div className="bg-white border rounded-lg p-4">
          {content === "initial" ? (
            <div>
              <h3>Initial Content</h3>
              <p>This is the initial content with embedded tweets:</p>
              <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">
                1963432588611391561
              </blockquote>
              <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">
                1963473315944640925
              </blockquote>
            </div>
          ) : (
            <div>
              <h3>Changed Content</h3>
              <p>This is the changed content. The tweets should remain stable:</p>
              <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">
                1963296096861786599
              </blockquote>
              <p>Additional content after DOM change.</p>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Content Area */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Dynamic Content Area</h2>
        <div 
          id="dynamic-content" 
          className="bg-gray-50 border rounded-lg p-4 min-h-[100px]"
        >
          <p className="text-gray-500 text-center">Dynamic content will appear here</p>
        </div>
      </div>

      {/* Test Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Test Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Wait for the initial tweets to load and display properly</li>
          <li>Click "Trigger DOM Change" - tweets should remain stable and not move to top</li>
          <li>Click "Add Dynamic Content" - new tweets should be processed without affecting existing ones</li>
          <li>Monitor the statistics panel - numbers should remain stable during changes</li>
          <li>Check browser console for any error messages or cleanup cycles</li>
          <li>Verify that tweets don't revert to blockquotes during DOM changes</li>
        </ol>
      </div>

      {/* Expected Behavior */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Expected Behavior</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>✅ Tweets should load and remain in their original positions</li>
          <li>✅ DOM changes should not cause tweets to move to the top</li>
          <li>✅ Tweets should not revert to blockquotes during navigation</li>
          <li>✅ Statistics should show stable numbers (no constant cleanup cycles)</li>
          <li>✅ Console should show "preserved" and "repositioned" messages, not constant cleanup</li>
          <li>✅ New dynamic content should be processed without affecting existing embeds</li>
        </ul>
      </div>

      {/* Include SocialMediaEmbedder */}
      <SocialMediaEmbedder />
    </div>
  );
};

export default EmbedStabilityTest;
