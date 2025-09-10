import React, { useContext } from "react";
import { useRouter } from "next/router";

/**
 * Safe hook to access cricket data only when on cricket page
 * Returns default values when not on cricket page to prevent API calls
 */
export const useCricketData = () => {
  const router = useRouter();
  const isCricketPage = router.pathname === "/livecricket";

  // Default cricket data structure
  const defaultCricketData = {
    data: null,
    fetchData: () => {},
    liveScores: [],
    isLiveScore: false,
    fetchLiveScores: () => {},
    liveScoresError: null,
    loadingLiveScores: false,
    recentScores: [],
    fetchRecentScores: () => {},
    recentScoresError: null,
    loadingRecentScores: false,
    schedule: null,
    fetchSchedule: () => {},
    scheduleError: null,
    loadingSchedule: false,
    upcomingMatches: [],
    fetchUpcomingMatches: () => {},
    upcomingMatchesError: null,
    loadingUpcomingMatches: false,
  };

  // Only try to access cricket context on cricket page
  if (!isCricketPage) {
    return defaultCricketData;
  }

  // Dynamically import and use the cricket context only on cricket page
  try {
    // This will only work when DataProvider is available (on cricket page)
    const { useData } = require("../store/HandleApiContext");
    return useData();
  } catch (error) {
    // Context not available, return defaults
    console.warn("Cricket context not available:", error.message);
    return defaultCricketData;
  }
};

/**
 * Hook to safely check if live cricket matches are available
 * Only makes API calls on cricket page
 */
export const useIsLiveCricket = () => {
  const router = useRouter();
  const isCricketPage = router.pathname === "/livecricket";

  if (!isCricketPage) {
    return false;
  }

  try {
    const cricketData = useCricketData();
    return cricketData?.isLiveScore || false;
  } catch (error) {
    return false;
  }
};

/**
 * Hook to get cricket page status
 */
export const useIsCricketPage = () => {
  const router = useRouter();
  return router.pathname === "/livecricket";
};

export default useCricketData;
