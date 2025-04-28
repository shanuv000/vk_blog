import { useState, useEffect } from "react";

/**
 * Custom hook for managing cricket match data
 * @param {Function} fetchMatches - Function to fetch match data
 * @param {Array} matches - Array of match data
 * @returns {Object} - Object containing headings, selected heading, and refresh functionality
 */
const useMatchData = (fetchMatches, matches) => {
  const [headings, setHeadings] = useState([]);
  const [selectedHeading, setSelectedHeading] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (matches && matches.length > 0) {
      // Extract unique headings from matches
      const uniqueHeadings = Array.from(
        new Set(matches.map((match) => match.heading))
      );
      setHeadings(uniqueHeadings);
      
      // Set the first heading as selected if not already set
      if (!selectedHeading || !uniqueHeadings.includes(selectedHeading)) {
        setSelectedHeading(uniqueHeadings[0] || "");
      }
    } else {
      // Reset headings if no matches
      setHeadings([]);
      setSelectedHeading("");
    }
  }, [matches, selectedHeading]);

  /**
   * Handle refresh button click
   */
  const handleRefreshClick = () => {
    setIsRefreshing(true);
    
    // Fetch new data
    fetchMatches().catch(error => {
      console.error("Error refreshing match data:", error);
    }).finally(() => {
      // End refreshing state after 1 second for better UX
      setTimeout(() => setIsRefreshing(false), 1000);
    });
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
