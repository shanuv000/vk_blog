import React, { useEffect, useState } from "react";

const SocialMediaDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({
    blockquotes: [],
    cspErrors: [],
    scriptErrors: [],
    embedStatus: {}
  });

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== "development") return;

    const checkEmbedStatus = () => {
      const info = {
        blockquotes: [],
        cspErrors: [],
        scriptErrors: [],
        embedStatus: {
          twitter: window.twttr ? "loaded" : "not loaded",
          facebook: window.FB ? "loaded" : "not loaded",
          instagram: document.querySelector('script[src*="instagram"]') ? "script found" : "no script"
        }
      };

      // Check blockquotes
      const blockquotes = document.querySelectorAll("blockquote");
      blockquotes.forEach((bq, i) => {
        const text = bq.textContent.trim();
        info.blockquotes.push({
          index: i,
          text: text.substring(0, 100),
          processed: bq.getAttribute("data-processed") === "true",
          embedProcessed: bq.getAttribute("data-embed-processed") === "true",
          hasLinks: bq.querySelectorAll("a").length > 0,
          isTweetId: /^\d+$/.test(text) && text.length > 8
        });
      });

      // Check for CSP errors in console
      const originalError = console.error;
      console.error = (...args) => {
        const message = args.join(" ");
        if (message.includes("Content Security Policy") || 
            message.includes("CSP") || 
            message.includes("frame-src") ||
            message.includes("script-src")) {
          info.cspErrors.push(message);
        }
        originalError.apply(console, args);
      };

      setDebugInfo(info);
    };

    // Initial check
    checkEmbedStatus();

    // Check again after content loads
    const timer = setTimeout(checkEmbedStatus, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Only render in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg shadow-lg max-w-md text-xs z-50 max-h-96 overflow-y-auto">
      <h3 className="font-bold mb-2">Social Media Debug Info</h3>
      
      <div className="mb-2">
        <strong>Embed Scripts:</strong>
        <ul className="ml-2">
          <li>Twitter: {debugInfo.embedStatus.twitter}</li>
          <li>Facebook: {debugInfo.embedStatus.facebook}</li>
          <li>Instagram: {debugInfo.embedStatus.instagram}</li>
        </ul>
      </div>

      <div className="mb-2">
        <strong>Blockquotes ({debugInfo.blockquotes.length}):</strong>
        {debugInfo.blockquotes.map((bq, i) => (
          <div key={i} className="ml-2 mb-1 p-1 bg-gray-800 rounded">
            <div>#{i}: {bq.text}...</div>
            <div className="text-xs text-gray-400">
              Processed: {bq.processed ? "✓" : "✗"} | 
              Embed: {bq.embedProcessed ? "✓" : "✗"} | 
              Links: {bq.hasLinks ? "✓" : "✗"} | 
              Tweet ID: {bq.isTweetId ? "✓" : "✗"}
            </div>
          </div>
        ))}
      </div>

      {debugInfo.cspErrors.length > 0 && (
        <div className="mb-2">
          <strong className="text-red-400">CSP Errors:</strong>
          {debugInfo.cspErrors.map((error, i) => (
            <div key={i} className="ml-2 text-red-300 text-xs">{error}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SocialMediaDebugger;
