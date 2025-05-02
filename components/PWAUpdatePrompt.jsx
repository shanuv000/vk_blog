import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PWAUpdatePrompt = () => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    // Only run in the browser
    if (typeof window === 'undefined') return;

    // Check if service worker is supported
    if ('serviceWorker' in navigator) {
      // Listen for the controlling service worker changing
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        setShowUpdatePrompt(true);
      });

      // Check for updates every 60 minutes
      const checkForUpdates = () => {
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration) {
            registration.update();
          }
        });
      };

      // Initial check
      checkForUpdates();

      // Set interval for checking updates
      const interval = setInterval(checkForUpdates, 60 * 60 * 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  return (
    <AnimatePresence>
      {showUpdatePrompt && (
        <motion.div 
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-lg shadow-lg p-4 z-50 border-l-4 border-urtechy-orange"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">Update Available</h3>
              <p className="text-sm text-gray-600 mb-3">A new version of urTechy Blogs is available. Refresh to update.</p>
              <div className="flex space-x-2">
                <button 
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-urtechy-orange text-white rounded-md text-sm font-medium hover:bg-urtechy-red transition-colors"
                >
                  Update Now
                </button>
                <button 
                  onClick={handleDismiss}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
            <button 
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAUpdatePrompt;
