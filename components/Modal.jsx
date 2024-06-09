import React, { useState } from "react";
import MatchTable from "./AdditionalPosts/MatchTable";
import LiveMatch from "./Cricket/LiveMatch";
import RecentMatch from "./Cricket/RecentMatch";
import UpcomingMatch from "./Cricket/UpcomingMatch";

const Modal = ({ show, onClose }) => {
  const [selectedTab, setSelectedTab] = useState("live");

  if (!show) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 w-full max-w-4xl mx-2 sm:mx-4 md:mx-6 lg:mx-auto relative max-h-screen overflow-y-auto">
        <button
          className="absolute top-2 right-2 bg-red-500 text-white py-1 px-2 rounded-full hover:bg-red-700 transition duration-200"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <button
            className={`px-4 py-2 m-1 sm:m-0 sm:mr-2 ${
              selectedTab === "live"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-black"
            } rounded`}
            onClick={() => setSelectedTab("live")}
          >
            Live Match
          </button>
          <button
            className={`px-4 py-2 m-1 sm:m-0 sm:mr-2 ${
              selectedTab === "recent"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-black"
            } rounded`}
            onClick={() => setSelectedTab("recent")}
          >
            Recent Match
          </button>{" "}
          <button
            className={`px-4 py-2 m-1 sm:m-0 sm:mr-2 ${
              selectedTab === "upcoming"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-black"
            } rounded`}
            onClick={() => setSelectedTab("upcoming")}
          >
            Upcoming Match
          </button>
          <button
            className={`px-4 py-2 m-1 sm:m-0 ${
              selectedTab === "table"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-black"
            } rounded`}
            onClick={() => setSelectedTab("table")}
          >
            T20 World<span className="text-orange-400">Cup</span> Rankings
          </button>
        </div>
        <div className="w-full">
          {selectedTab === "live" && (<LiveMatch /> || <p>No Live matches</p>)}
          {selectedTab === "recent" && <RecentMatch />}
          {selectedTab === "upcoming" && <UpcomingMatch />}
          {selectedTab === "table" && <MatchTable />}
        </div>
      </div>
    </div>
  );
};

export default Modal;
