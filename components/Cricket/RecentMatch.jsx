import React from "react";
import MatchList from "./MatchList";
import useMatchData from "../../hooks/useMatchData";
import { useData } from "../../store/HandleApiContext";

const RecentMatch = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8 bg-gray-50 rounded-lg border border-gray-100">
      <div className="bg-white p-4 rounded-full shadow-sm mb-4">
        <svg
          className="w-12 h-12 text-urtechy-red"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        Recent Matches Coming Soon
      </h3>
      <p className="text-gray-500 max-w-md">
        We are currently upgrading our recent matches data to provide you with
        more detailed statistics and scorecards. Please check back later!
      </p>
    </div>
  );
};

export default RecentMatch;
