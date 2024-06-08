// Importing necessary modules and functions from React and axios
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { fetchData } from "../components/ExtractIPs/ipfunc";

// Creating a context with default values for the data and live scores
const DataContext = createContext({
  data: null, // State to hold fetched data
  fetchData: () => {}, // Function to fetch data
  liveScores: null, // State to hold live scores
  fetchLiveScores: () => {}, // Function to fetch live scores
  liveScoresError: null, // State to hold any errors while fetching live scores
  loadingLiveScores: false, // State to indicate if live scores are being loaded
});

// DataProvider component to provide context values to its children
export const DataProvider = ({ children }) => {
  // State variables to manage data and live scores
  const [data, setData] = useState(null); // State to hold fetched data
  const [liveScores, setLiveScores] = useState([]); // State to hold live scores
  const [liveScoresError, setLiveScoresError] = useState(null); // State to hold any errors while fetching live scores
  const [loadingLiveScores, setLoadingLiveScores] = useState(false); // State to indicate if live scores are being loaded

  // Refs to ensure data fetching occurs only once
  const hasFetchedData = useRef(false); // Ref to check if data has been fetched
  const hasFetchedLiveScores = useRef(false); // Ref to check if live scores have been fetched

  // useEffect to fetch data when the component mounts
  useEffect(() => {
    if (!hasFetchedData.current) {
      hasFetchedData.current = true; // Mark data as fetched
      fetchDataAsync(); // Fetch data asynchronously
    }
  }, []);

  // useEffect to fetch live scores when the component mounts
  useEffect(() => {
    if (!hasFetchedLiveScores.current) {
      hasFetchedLiveScores.current = true; // Mark live scores as fetched
      fetchLiveScoresAsync(); // Fetch live scores asynchronously
    }
  }, []);

  // Function to fetch data asynchronously and update state
  const fetchDataAsync = async () => {
    const fetchedData = await fetchData(); // Fetch data using provided function
    setData(fetchedData); // Update state with fetched data
  };

  // Function to fetch live scores asynchronously and update state
  const fetchLiveScoresAsync = async () => {
    try {
      setLoadingLiveScores(true); // Set loading state to true
      const response = await axios.get(
        "https://api-sync.vercel.app/api/cricket/live-scores" // API endpoint to fetch live scores
      );
      setLiveScores(response.data); // Update state with fetched live scores
      setLiveScoresError(null); // Reset any previous errors
    } catch (error) {
      setLiveScoresError("Error fetching live scores: " + error.message); // Set error state
      setLiveScores([]); // Reset live scores state
    } finally {
      setLoadingLiveScores(false); // Set loading state to false
    }
  };

  // Providing context values to children components
  return (
    <DataContext.Provider
      value={{
        data, // Fetched data
        fetchData: fetchDataAsync, // Function to fetch data
        liveScores, // Fetched live scores
        fetchLiveScores: fetchLiveScoresAsync, // Function to fetch live scores
        liveScoresError, // Any error encountered while fetching live scores
        loadingLiveScores, // Loading state of live scores
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the DataContext values in other components
export const useData = () => useContext(DataContext);
