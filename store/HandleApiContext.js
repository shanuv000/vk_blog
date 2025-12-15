import React, { createContext, useContext } from "react";

/**
 * General data context for app-wide data
 * 
 * NOTE: Cricket data has been moved to CricketDataContext.js
 * and only loads on /livecricket page to prevent unnecessary API calls
 * on other pages.
 */

const DataContext = createContext({});

/**
 * DataProvider - Minimal global provider
 * Cricket APIs removed - they now only load on /livecricket
 */
export const DataProvider = ({ children }) => {
  // No global API calls here - homepage and cricket have their own providers
  // This context is kept for potential future app-wide state

  return (
    <DataContext.Provider value={{}}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
