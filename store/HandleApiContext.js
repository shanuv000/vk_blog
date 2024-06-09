import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { fetchData } from "../components/ExtractIPs/ipfunc";

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
  upcomingMatches: null, // New state for upcoming matches
  fetchUpcomingMatches: () => {}, // New function to fetch upcoming matches
  upcomingMatchesError: null, // New state for any errors while fetching upcoming matches
  loadingUpcomingMatches: false, // New state to indicate if upcoming matches are being loaded
});

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [liveScores, setLiveScores] = useState([]);
  const [liveScoresError, setLiveScoresError] = useState(null);
  const [loadingLiveScores, setLoadingLiveScores] = useState(false);
  const [recentScores, setRecentScores] = useState([]);
  const [recentScoresError, setRecentScoresError] = useState(null);
  const [loadingRecentScores, setLoadingRecentScores] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [scheduleError, setScheduleError] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [upcomingMatches, setUpcomingMatches] = useState([]); // New state for upcoming matches
  const [upcomingMatchesError, setUpcomingMatchesError] = useState(null); // New state for any errors while fetching upcoming matches
  const [loadingUpcomingMatches, setLoadingUpcomingMatches] = useState(false); // New state to indicate if upcoming matches are being loaded

  const hasFetchedData = useRef(false);
  const hasFetchedLiveScores = useRef(false);
  const hasFetchedRecentScores = useRef(false);
  const hasFetchedSchedule = useRef(false);
  const hasFetchedUpcomingMatches = useRef(false); // New ref for upcoming matches

  useEffect(() => {
    if (!hasFetchedData.current) {
      hasFetchedData.current = true;
      fetchDataAsync();
    }
  }, []);

  useEffect(() => {
    if (!hasFetchedLiveScores.current) {
      hasFetchedLiveScores.current = true;
      fetchLiveScoresAsync();
    }
  }, []);

  useEffect(() => {
    if (!hasFetchedRecentScores.current) {
      hasFetchedRecentScores.current = true;
      fetchRecentScoresAsync();
    }
  }, []);

  useEffect(() => {
    if (!hasFetchedSchedule.current) {
      hasFetchedSchedule.current = true;
      fetchScheduleAsync();
    }
  }, []);

  useEffect(() => {
    if (!hasFetchedUpcomingMatches.current) {
      hasFetchedUpcomingMatches.current = true;
      fetchUpcomingMatchesAsync();
    }
  }, []); // New useEffect to fetch upcoming matches

  const fetchDataAsync = async () => {
    const fetchedData = await fetchData();
    setData(fetchedData);
  };

  const fetchLiveScoresAsync = async () => {
    try {
      setLoadingLiveScores(true);
      const response = await axios.get(
        "https://api-sync.vercel.app/api/cricket/live-scores"
      );
      setLiveScores(response.data);
      setLiveScoresError(null);
    } catch (error) {
      setLiveScoresError("Error fetching live scores: " + error.message);
      setLiveScores([]);
    } finally {
      setLoadingLiveScores(false);
    }
  };

  const fetchRecentScoresAsync = async () => {
    try {
      setLoadingRecentScores(true);
      const response = await axios.get(
        "https://api-sync.vercel.app/api/cricket/recent-scores"
      );
      setRecentScores(response.data);
      setRecentScoresError(null);
    } catch (error) {
      setRecentScoresError("Error fetching recent scores: " + error.message);
      setRecentScores([]);
    } finally {
      setLoadingRecentScores(false);
    }
  };

  const fetchScheduleAsync = async () => {
    try {
      setLoadingSchedule(true);
      const response = await axios.get(
        "https://api-sync.vercel.app/api/cricket/schedule"
      );
      if (response.data.success) {
        const sortedData = response.data.data.sort(
          (a, b) => b.netRunRate - a.netRunRate
        );
        setSchedule(sortedData);
        setScheduleError(null);
      } else {
        setScheduleError("API request failed: " + response.data.error);
      }
    } catch (error) {
      setScheduleError("Error fetching schedule: " + error.message);
      setSchedule([]);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const fetchUpcomingMatchesAsync = async () => {
    try {
      setLoadingUpcomingMatches(true);
      const response = await axios.get(
        "https://api-sync.vercel.app/api/cricket/upcoming-matches"
      );
      setUpcomingMatches(response.data);
      setUpcomingMatchesError(null);
    } catch (error) {
      setUpcomingMatchesError(
        "Error fetching upcoming matches: " + error.message
      );
      setUpcomingMatches([]);
    } finally {
      setLoadingUpcomingMatches(false);
    }
  }; // New function to fetch upcoming matches

  return (
    <DataContext.Provider
      value={{
        data,
        fetchData: fetchDataAsync,
        liveScores,
        fetchLiveScores: fetchLiveScoresAsync,
        liveScoresError,
        loadingLiveScores,
        recentScores,
        fetchRecentScores: fetchRecentScoresAsync,
        recentScoresError,
        loadingRecentScores,
        schedule,
        fetchSchedule: fetchScheduleAsync,
        scheduleError,
        loadingSchedule,
        upcomingMatches, // Providing upcoming matches state
        fetchUpcomingMatches: fetchUpcomingMatchesAsync, // Providing fetch function
        upcomingMatchesError, // Providing error state
        loadingUpcomingMatches, // Providing loading state
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
