// Testing.js
"use client";
import Charts from "./ElectionResultsChart";
import electionResults from "./electionResults.json";

export const Testing = ({ slug }) => {
  const transformData = (jsonData) => {
    const { NDA, INDIA, regional_parties } =
      jsonData.election_results_2024.parties;

    const results = [
      { candidate: "NDA", votes: NDA.seats_won },
      { candidate: "INDIA", votes: INDIA.seats_won },
      { candidate: "TMC", votes: regional_parties.TMC.seats_won },
      { candidate: "AAP", votes: regional_parties.AAP.seats_won },
      { candidate: "TRS", votes: regional_parties.TRS.seats_won },
    ];

    return results;
  };

  const data = transformData(electionResults);

  let content;
  switch (slug) {
    case "indian-election-2024-key-highlights-political-shifts":
      content = (
        <div>
          <h1 className="text-center mb-3">Election Results 2024</h1>
          <Charts data={data} />
        </div>
      );
      break;
    default:
      content = null;
  }

  return <>{content}</>;
};
