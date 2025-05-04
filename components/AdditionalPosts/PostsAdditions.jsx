"use client";
import React, { useState, useEffect } from "react";
import Charts from "./ElectionResultsChart";

import MatchTable from "../Cricket/MatchTable";
import electionResults from "./electionResults.json";

export const transformData = (jsonData) => {
  const { NDA, INDIA, regional_parties } =
    jsonData.election_results_2024.parties;

  const results = [
    { candidate: "NDA", votes: NDA.seats_won },
    { candidate: "INDIA", votes: INDIA.seats_won },
    { candidate: "TMC", votes: regional_parties.TMC.seats_won },
    { candidate: "AAP", votes: regional_parties.AAP.seats_won },
    { candidate: "TRS", votes: regional_parties.TRS.seats_won },
    { candidate: "YSRCP", votes: regional_parties.YSRCP.seats_won },
    { candidate: "BJD", votes: regional_parties.BJD.seats_won },
  ];

  return results;
};

export const Testing = ({ slug = "" }) => {
  // Use useState to ensure client-side only rendering
  const [content, setContent] = useState(null);

  // Use useEffect to ensure this only runs on the client
  useEffect(() => {
    // Skip on server-side to avoid hydration mismatch
    if (typeof window === "undefined") return;

    // Skip if slug is not provided
    if (!slug) {
      setContent(null);
      return;
    }

    try {
      const data = transformData(electionResults);

      switch (slug) {
        case "indian-election-2024-key-highlights-political-shifts":
        case "narendra-modi-nomination-varanasi-symbolism-strategy":
          setContent(
            <div>
              <h1 className="text-2xl font-bold text-center mb-3">
                Election Results 2024
              </h1>
              <Charts data={data} />
            </div>
          );
          break;
        case "india-t20-world-cup-pakistan-new-york":
        case "kavya-maran-emotional-speech-ipl-2024":
        case "ind-vs-sl-shami-sitting-at-home-baffles-me-ravi-shastri-after-indias-asia-cup-loss-vs-sri-lanka-3322380":
          setContent(null); // <MatchTable />;
          break;
        default:
          setContent(null);
      }
    } catch (error) {
      console.error("Error in Testing component:", error);
      setContent(null);
    }
  }, [slug]);

  return <>{content}</>;
};
