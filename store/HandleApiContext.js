import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";
// import { fetchData } from "../components/ExtractIPs/ipfunc";

// Custom hook for fetching data
const useFetchData = (url, extractData = (data) => data, initialState = []) => {
  const [data, setData] = useState(initialState);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);

  const fetchDataAsync = async () => {
    try {
      setLoading(true);
      const response = await axios.get(url);
      const fetchedData = extractData(response.data);

      // Ensure data is in the correct format (array for certain states)
      if (Array.isArray(initialState) && !Array.isArray(fetchedData)) {
        throw new Error("Expected data to be an array");
      }

      setData(fetchedData);
      setError(null);
    } catch (error) {
      setError("Error fetching data: " + error.message);
      setData(initialState);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchDataAsync();
    }
  }, [url]);

  return { data, error, loading, refetch: fetchDataAsync };
};

const DataContext = createContext({
  data: null,
  fetchData: () => {},
  liveScores: null,
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
  const { data, refetch: fetchData } = useFetchData(
    "https://api-sync.vercel.app/api/cricket/schedule",
    null
  );
  const {
    data: liveScores,
    error: liveScoresError,
    loading: loadingLiveScores,
    refetch: fetchLiveScores,
  } = useFetchData(
    "https://api-sync.vercel.app/api/cricket/live-scores",
    (data) => data,
    []
  );

  const {
    data: recentScores,
    error: recentScoresError,
    loading: loadingRecentScores,
    refetch: fetchRecentScores,
  } = useFetchData(
    "https://api-sync.vercel.app/api/cricket/recent-scores",
    (data) => data,
    []
  );

  const {
    data: schedule,
    error: scheduleError,
    loading: loadingSchedule,
    refetch: fetchSchedule,
  } = useFetchData(
    "https://api-sync.vercel.app/api/cricket/schedule",
    (response) => response.data.groups, // Corrected data extraction
    (data) => data,
    []
  );

  const {
    data: upcomingMatches,
    error: upcomingMatchesError,
    loading: loadingUpcomingMatches,
    refetch: fetchUpcomingMatches,
  } = useFetchData(
    "https://api-sync.vercel.app/api/cricket/upcoming-matches",
    (data) => data,
    []
  );

  return (
    <DataContext.Provider
      value={{
        data,
        fetchData,
        liveScores,
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
