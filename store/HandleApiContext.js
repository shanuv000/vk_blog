import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";

/**
 * General data context for non-cricket data
 * Cricket data has been moved to CricketDataContext.js
 * and only loads on /livecricket page
 */

// Custom hook for fetching data with improved error handling
const useFetchData = (url, extractData = (data) => data, initialState = []) => {
  const [data, setData] = useState(initialState);
  const [dataExist, setDataExist] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);
  const retryCount = useRef(0);
  const MAX_RETRIES = 2;

  const fetchDataAsync = async (forceRetry = false) => {
    if (forceRetry) {
      retryCount.current = 0;
    }

    try {
      setLoading(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await axios.get(url, {
        signal: controller.signal,
        params: { _t: new Date().getTime() },
      });

      clearTimeout(timeoutId);

      if (!response.data) {
        throw new Error("Empty response from server");
      }

      let fetchedData;
      if (typeof extractData === "function") {
        fetchedData = extractData(response.data);
      } else {
        fetchedData = response.data;
      }

      if (
        Array.isArray(initialState) &&
        fetchedData !== null &&
        !Array.isArray(fetchedData)
      ) {
        if (typeof fetchedData === "object") {
          const hasNumericKeys = Object.keys(fetchedData).some(
            (key) => !isNaN(parseInt(key))
          );
          if (hasNumericKeys) {
            fetchedData = Object.values(fetchedData);
          } else if (fetchedData.data && Array.isArray(fetchedData.data)) {
            fetchedData = fetchedData.data;
          } else {
            fetchedData = [fetchedData];
          }
        } else {
          fetchedData = [];
        }
      }

      setData(fetchedData || initialState);
      setDataExist(fetchedData && fetchedData.length > 0);
      setError(null);
      retryCount.current = 0;
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);

      let errorMessage = "Unable to load data. ";

      if (
        error.code === "ERR_NETWORK" ||
        error.code === "ERR_CONNECTION_REFUSED"
      ) {
        errorMessage += "Network connection issue.";
      } else if (error.code === "ERR_CANCELED") {
        errorMessage += "Request timed out.";
      } else if (error.response) {
        errorMessage += `Server error (${error.response.status}).`;
      } else {
        errorMessage += error.message;
      }

      setError(errorMessage);

      if (!data || (Array.isArray(data) && data.length === 0)) {
        setData(initialState);
      }

      if (
        (error.code === "ERR_NETWORK" ||
          error.code === "ERR_CONNECTION_REFUSED") &&
        retryCount.current < MAX_RETRIES
      ) {
        retryCount.current++;
        const delay = 2000 * Math.pow(2, retryCount.current - 1);
        setTimeout(() => fetchDataAsync(), delay);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && !hasFetched.current) {
      hasFetched.current = true;
      fetchDataAsync();
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

// Simplified context - cricket data moved to CricketDataContext
const DataContext = createContext({
  data: null,
  fetchData: () => {},
});

export const DataProvider = ({ children }) => {
  // Only keep non-cricket data here
  // Cricket data is now in CricketDataContext and only loads on /livecricket
  const API_BASE = "/api/cricket-proxy?endpoint=";

  const { data, refetch: fetchData } = useFetchData(
    `${API_BASE}schedule`,
    (data) => data
  );

  return (
    <DataContext.Provider
      value={{
        data,
        fetchData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
