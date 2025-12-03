import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";
// import { fetchData } from "../components/ExtractIPs/ipfunc";

// Custom hook for fetching data with improved error handling and fallbacks
const useFetchData = (url, extractData = (data) => data, initialState = []) => {
  const [data, setData] = useState(initialState);
  const [dataExist, setDataExist] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);
  const retryCount = useRef(0);
  const MAX_RETRIES = 2;

  const fetchDataAsync = async (forceRetry = false) => {
    // Reset retry count if this is a manual refresh
    if (forceRetry) {
      retryCount.current = 0;
    }

    try {
      setLoading(true);

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await axios.get(url, {
        signal: controller.signal,
        // Add cache-busting parameter to avoid stale data
        params: { _t: new Date().getTime() },
      });

      clearTimeout(timeoutId);

      // Check if response is valid
      if (!response.data) {
        throw new Error("Empty response from server");
      }

      // Handle case where extractData is not provided or is null
      let fetchedData;
      if (typeof extractData === "function") {
        fetchedData = extractData(response.data);
      } else {
        // If no extractData function is provided, use the response data directly
        fetchedData = response.data;
      }

      // Ensure data is in the correct format (array for certain states)
      if (
        Array.isArray(initialState) &&
        fetchedData !== null &&
        !Array.isArray(fetchedData)
      ) {
        console.warn("Expected array data but received:", typeof fetchedData);
        // Convert to array if possible or use empty array
        if (typeof fetchedData === "object") {
          // Try to convert object to array if it has numeric keys
          const hasNumericKeys = Object.keys(fetchedData).some(
            (key) => !isNaN(parseInt(key))
          );
          if (hasNumericKeys) {
            fetchedData = Object.values(fetchedData);
          } else {
            // If it's an object with data property that's an array, use that
            if (fetchedData.data && Array.isArray(fetchedData.data)) {
              fetchedData = fetchedData.data;
            } else {
              // Wrap the object in an array as last resort
              fetchedData = [fetchedData];
            }
          }
        } else {
          // Default to empty array if conversion not possible
          fetchedData = [];
        }
      }

      setData(fetchedData || initialState);
      setDataExist(fetchedData && fetchedData.length > 0);
      setError(null);
      retryCount.current = 0; // Reset retry count on success
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);

      // Provide more user-friendly error messages
      let errorMessage = "Unable to load data. ";

      if (
        error.code === "ERR_NETWORK" ||
        error.code === "ERR_CONNECTION_REFUSED"
      ) {
        errorMessage += "Network connection issue.";
      } else if (error.code === "ERR_CANCELED") {
        errorMessage += "Request timed out.";
      } else if (error.response) {
        // Server responded with an error status
        errorMessage += `Server error (${error.response.status}).`;
      } else {
        errorMessage += error.message;
      }

      setError(errorMessage);

      // Keep existing data if available, otherwise use initial state
      if (!data || (Array.isArray(data) && data.length === 0)) {
        setData(initialState);
      }

      // Auto-retry for network errors, but limit retries
      if (
        (error.code === "ERR_NETWORK" ||
          error.code === "ERR_CONNECTION_REFUSED") &&
        retryCount.current < MAX_RETRIES
      ) {
        retryCount.current++;
        // Exponential backoff for retries
        const delay = 2000 * Math.pow(2, retryCount.current - 1);
        setTimeout(() => fetchDataAsync(), delay);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data if we're on the client side and haven't fetched yet
    if (typeof window !== "undefined" && !hasFetched.current) {
      hasFetched.current = true;
      fetchDataAsync();
    }

    // Set up periodic refresh for live data only on client side
    if (typeof window !== "undefined" && url.includes("live-scores")) {
      const refreshInterval = setInterval(() => {
        fetchDataAsync();
      }, 60000); // Refresh live scores every minute

      return () => clearInterval(refreshInterval);
    }
  }, [url]);

  return {
    data,
    error,
    loading,
    dataExist,
    refetch: () => fetchDataAsync(true),
  };
};

const DataContext = createContext({
  data: null,
  fetchData: () => {},
  liveScores: null,
  isLiveScore: false,
  fetchLiveScores: () => {},
  liveScoresError: null,
  loadingLiveScores: false,
  recentScores: null,
  fetchRecentScores: () => {},
  recentScoresError: null,
  loadingRecentScores: false,
  schedule: null,
  fetchSchedule: () => {},
  scheduleError: null,
  loadingSchedule: false,
  upcomingMatches: null,
  fetchUpcomingMatches: () => {},
  upcomingMatchesError: null,
  loadingUpcomingMatches: false,
});

export const DataProvider = ({ children }) => {
  // Use our local proxy API to avoid CORS issues
  const API_BASE = "/api/cricket-proxy?endpoint=";

  // Use identity function instead of null for extractData
  const { data, refetch: fetchData } = useFetchData(
    `${API_BASE}schedule`,
    (data) => data
  );

  const {
    data: liveScores,
    error: liveScoresError,
    loading: loadingLiveScores,
    refetch: fetchLiveScores,
    dataExist: isLiveScore,
  } = useFetchData(`${API_BASE}live-scores`, (response) => {
    if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return response.data || [];
  }, []);

  // const {
  //   data: recentScores,
  //   error: recentScoresError,
  //   loading: loadingRecentScores,
  //   refetch: fetchRecentScores,
  // } = useFetchData(`${API_BASE}recent-scores`, (response) => {
  //   if (response && response.data && Array.isArray(response.data)) {
  //     return response.data;
  //   }
  //   return response.data || [];
  // }, []);

  // Temporarily disabled
  const recentScores = [];
  const recentScoresError = null;
  const loadingRecentScores = false;
  const fetchRecentScores = () => {};

  const {
    data: schedule,
    error: scheduleError,
    loading: loadingSchedule,
    refetch: fetchSchedule,
  } = useFetchData(
    `${API_BASE}schedule`,
    (response) => {
      // More robust data extraction with better error handling
      if (response && response.data && response.data.groups) {
        return response.data.groups;
      } else if (response && response.fallback) {
        // Use fallback data if available
        return response.fallback.groups || [];
      } else if (Array.isArray(response)) {
        // If response is already an array, use it directly
        return response;
      } else {
        // Default empty array
        return [];
      }
    },
    []
  );

  const {
    data: upcomingMatches,
    error: upcomingMatchesError,
    loading: loadingUpcomingMatches,
    refetch: fetchUpcomingMatches,
  } = useFetchData(`${API_BASE}upcoming-matches`, (response) => {
    if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return response.data || [];
  }, []);

  return (
    <DataContext.Provider
      value={{
        data,
        fetchData,
        liveScores,
        isLiveScore,
        fetchLiveScores,
        liveScoresError,
        loadingLiveScores,
        recentScores,
        fetchRecentScores,
        recentScoresError,
        loadingRecentScores,
        schedule,
        fetchSchedule,
        scheduleError,
        loadingSchedule,
        upcomingMatches,
        fetchUpcomingMatches,
        upcomingMatchesError,
        loadingUpcomingMatches,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
