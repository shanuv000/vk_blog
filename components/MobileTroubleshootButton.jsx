import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MobileTroubleshootButton = () => {
  const [showButton, setShowButton] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only run in the browser
    if (typeof window === 'undefined') return;

    // Check if we're on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    // Only show on mobile devices
    if (isMobile) {
      // Wait a bit before showing the button
      const timer = setTimeout(() => {
        setShowButton(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTroubleshoot = () => {
    // Set flag to trigger service worker cleanup on next load
    localStorage.setItem('pwa_needs_cleanup', 'true');
    // Reload the page to start the cleanup process
    window.location.reload();
  };

  return (
    <>
      <AnimatePresence>
        {showButton && !showPrompt && (
          <motion.button
            className="fixed bottom-4 right-4 bg-blue-500 text-white rounded-full p-3 shadow-lg z-40"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setShowPrompt(true)}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 10V3L4 14h7v7l9-11h-7z" 
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPrompt && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-sm"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3 className="text-xl font-bold mb-2">App Not Working?</h3>
              <p className="text-gray-600 mb-4">
                If you're experiencing issues with the app not loading data or getting stuck, 
                try resetting it. This will clear cached data and may fix the problem.
              </p>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={handleTroubleshoot}
                  className="w-full py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
                >
                  Reset App Data
                </button>
                <button
                  onClick={() => setShowPrompt(false)}
                  className="w-full py-2 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileTroubleshootButton;
