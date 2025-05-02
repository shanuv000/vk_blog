import { useEffect } from 'react';

// This component helps clean up problematic service workers
const ServiceWorkerCleanup = () => {
  useEffect(() => {
    // Only run in the browser
    if (typeof window === 'undefined') return;

    // Function to unregister all service workers
    const cleanupServiceWorkers = async () => {
      if ('serviceWorker' in navigator) {
        try {
          // Get all service worker registrations
          const registrations = await navigator.serviceWorker.getRegistrations();
          
          // Check if we have the cleanup flag in localStorage
          const needsCleanup = localStorage.getItem('pwa_needs_cleanup');
          
          if (needsCleanup === 'true') {
            console.log('Cleaning up service workers...');
            
            // Unregister all service workers
            for (const registration of registrations) {
              await registration.unregister();
              console.log('Service worker unregistered');
            }
            
            // Clear all caches
            if ('caches' in window) {
              const cacheNames = await caches.keys();
              await Promise.all(
                cacheNames.map(cacheName => {
                  return caches.delete(cacheName);
                })
              );
              console.log('Caches cleared');
            }
            
            // Remove the cleanup flag
            localStorage.removeItem('pwa_needs_cleanup');
            
            // Reload the page to get a fresh start
            window.location.reload();
          }
        } catch (error) {
          console.error('Error cleaning up service workers:', error);
        }
      }
    };

    // Run the cleanup
    cleanupServiceWorkers();
  }, []);

  // This component doesn't render anything
  return null;
};

export default ServiceWorkerCleanup;
