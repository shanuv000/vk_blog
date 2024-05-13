import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { fetchData } from "../components/ExtractIPs/ipfunc";

const DataContext = createContext({ data: null, fetchData: () => {} });

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(null);

  const hasFetchedData = useRef(false); // Ref to track if data has been fetched

  useEffect(() => {
    if (!hasFetchedData.current) {
      // Only fetch if not fetched before
      hasFetchedData.current = true; // Mark data as fetched
      fetchDataAsync();
    }
  }, []); // Empty dependency array ensures this runs only once

  const fetchDataAsync = async () => {
    const fetchedData = await fetchData();
    setData(fetchedData);
  };

  return (
    <DataContext.Provider value={{ data, fetchData: fetchDataAsync }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
