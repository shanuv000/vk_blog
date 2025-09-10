import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Lazy-loaded cricket data provider that only initializes on cricket page
 * This prevents unnecessary API calls on other pages
 */
const LazyDataProvider = ({ children }) => {
  const router = useRouter();
  const [DataProvider, setDataProvider] = useState(null);
  const isCricketPage = router.pathname === '/livecricket';

  useEffect(() => {
    // Only load the cricket data provider when on cricket page
    if (isCricketPage && !DataProvider) {
      // Dynamically import the cricket data provider
      import('./HandleApiContext').then((module) => {
        setDataProvider(() => module.DataProvider);
      }).catch((error) => {
        console.error('Failed to load cricket data provider:', error);
      });
    }
  }, [isCricketPage, DataProvider]);

  // If we're on cricket page and provider is loaded, use it
  if (isCricketPage && DataProvider) {
    return React.createElement(DataProvider, null, children);
  }

  // For all other pages, just render children without cricket context
  return children;
};

export default LazyDataProvider;
