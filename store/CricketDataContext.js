import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import axios from "axios";

/**
 * CricketDataContext - Isolated context for cricket data
 * Only fetches data when mounted (on /livecricket page)
 * Includes visibility-aware polling that pauses when tab is hidden
 */

const CricketDataContext = createContext({
  liveScores: [],
  liveScoresError: null,
  loadingLiveScores: true,
  fetchLiveScores: () => {},
  recentScores: [],
  recentScoresError: null,
  loadingRecentScores: true,
  fetchRecentScores: () => {},
  upcomingMatches: [],
  upcomingMatchesError: null,
  loadingUpcomingMatches: true,
  fetchUpcomingMatches: () => {},
  isLiveScore: false,
});

const API_BASE = "/api/cricket-proxy?endpoint=";
const LIVE_REFRESH_INTERVAL = 60000; // 60 seconds for live scores
const MAX_RETRIES = 2;

/**
 * Hook for visibility-aware data fetching
 * Pauses polling when tab/page is hidden to save resources
 */
const useVisibilityAwareFetch = (
  endpoint,
  extractData,
  initialState = [],
  autoRefreshInterval = null
) => {
  const [data, setData] = useState(initialState);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataExist, setDataExist] = useState(false);
  
  const retryCount = useRef(0);
  const intervalRef = useRef(null);
  const isVisibleRef = useRef(true);
  const hasFetchedRef = useRef(false);

  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      retryCount.current = 0;
    }

    try {
      setLoading(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await axios.get(`${API_BASE}${endpoint}`, {
        signal: controller.signal,
        params: { _t: Date.now() },
      });

      clearTimeout(timeoutId);

      if (!response.data) {
        throw new Error("Empty response");
      }

      let fetchedData = extractData(response.data);

      // Ensure array format
      if (Array.isArray(initialState) && !Array.isArray(fetchedData)) {
        if (fetchedData?.data && Array.isArray(fetchedData.data)) {
          fetchedData = fetchedData.data;
        } else {
          fetchedData = [];
        }
      }

      setData(fetchedData || initialState);
      setDataExist(fetchedData && fetchedData.length > 0);
      setError(null);
      retryCount.current = 0;
    } catch (err) {
      console.error(`Cricket API error (${endpoint}):`, err.message);

      let errorMessage = "Unable to load data. ";
      if (err.code === "ERR_NETWORK" || err.code === "ERR_CONNECTION_REFUSED") {
        errorMessage += "Network issue.";
      } else if (err.code === "ERR_CANCELED") {
        errorMessage += "Request timed out.";
      } else if (err.response) {
        errorMessage += `Server error (${err.response.status}).`;
      } else {
        errorMessage += err.message;
      }

      setError(errorMessage);

      // Auto-retry with exponential backoff
      if (
        (err.code === "ERR_NETWORK" || err.code === "ERR_CONNECTION_REFUSED") &&
        retryCount.current < MAX_RETRIES
      ) {
        retryCount.current++;
        const delay = 2000 * Math.pow(2, retryCount.current - 1);
        setTimeout(() => fetchData(), delay);
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, extractData, initialState]);

  // Visibility change handler - pause/resume polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === "visible";

      if (isVisibleRef.current && autoRefreshInterval) {
        // Tab became visible - fetch fresh data and restart interval
        fetchData();
        startPolling();
      } else if (!isVisibleRef.current && intervalRef.current) {
        // Tab hidden - stop polling to save resources
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const startPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (autoRefreshInterval && isVisibleRef.current) {
        intervalRef.current = setInterval(() => {
          if (isVisibleRef.current) {
            fetchData();
          }
        }, autoRefreshInterval);
      }
    };

    // Initial fetch
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchData();
    }

    // Set up visibility listener
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Start polling if needed
    if (autoRefreshInterval) {
      startPolling();
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, autoRefreshInterval]);

  return {
    data,
    error,
    loading,
    dataExist,
    refetch: () => fetchData(true),
  };
};

/**
 * CricketDataProvider - Isolated provider for cricket data
 * Place this ONLY on the /livecricket page to avoid global API calls
 */
export const CricketDataProvider = ({ children }) => {
  // Live scores with auto-refresh (visibility-aware)
  const {
    data: liveScores,
    error: liveScoresError,
    loading: loadingLiveScores,
    refetch: fetchLiveScores,
    dataExist: isLiveScore,
  } = useVisibilityAwareFetch(
    "live-scores",
    (response) => response?.data || [],
    [],
    LIVE_REFRESH_INTERVAL // Auto-refresh every 60s, pauses when hidden
  );

  // Recent scores - no auto-refresh
  const {
    data: recentScores,
    error: recentScoresError,
    loading: loadingRecentScores,
    refetch: fetchRecentScores,
  } = useVisibilityAwareFetch(
    "recent-scores",
    (response) => response?.data || [],
    []
  );

  // Upcoming matches - no auto-refresh
  const {
    data: upcomingMatches,
    error: upcomingMatchesError,
    loading: loadingUpcomingMatches,
    refetch: fetchUpcomingMatches,
  } = useVisibilityAwareFetch(
    "upcoming-matches",
    (response) => response?.data || [],
    []
  );

  return (
    <CricketDataContext.Provider
      value={{
        liveScores,
        liveScoresError,
        loadingLiveScores,
        fetchLiveScores,
        isLiveScore,
        recentScores,
        recentScoresError,
        loadingRecentScores,
        fetchRecentScores,
        upcomingMatches,
        upcomingMatchesError,
        loadingUpcomingMatches,
        fetchUpcomingMatches,
      }}
    >
      {children}
    </CricketDataContext.Provider>
  );
};

export const useCricketData = () => useContext(CricketDataContext);

export default CricketDataProvider;
