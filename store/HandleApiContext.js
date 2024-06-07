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
});

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [liveScores, setLiveScores] = useState([]);
  const [liveScoresError, setLiveScoresError] = useState(null);
  const [loadingLiveScores, setLoadingLiveScores] = useState(false);

  const hasFetchedData = useRef(false);
  const hasFetchedLiveScores = useRef(false);

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

  return (
    <DataContext.Provider
      value={{
        data,
        fetchData: fetchDataAsync,
        liveScores,
        fetchLiveScores: fetchLiveScoresAsync,
        liveScoresError,
        loadingLiveScores,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
