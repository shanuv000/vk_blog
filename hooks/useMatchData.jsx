import { useState, useEffect } from "react";

const useMatchData = (fetchMatches, matches) => {
  const [headings, setHeadings] = useState([]);
  const [selectedHeading, setSelectedHeading] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (matches && matches.length > 0) {
      const uniqueHeadings = Array.from(
        new Set(matches.map((match) => match.heading))
      );
      setHeadings(uniqueHeadings);
      setSelectedHeading(uniqueHeadings[0] || "");
    }
  }, [matches]);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    fetchMatches();
    setTimeout(() => setIsRefreshing(false), 1000); // Simulate refreshing animation duration
  };

  return {
    headings,
    selectedHeading,
    setSelectedHeading,
    isRefreshing,
    handleRefreshClick,
  };
};

export default useMatchData;
