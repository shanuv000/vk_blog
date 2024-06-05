// Testing.js
"use client";
import Charts from "./ElectionResultsChart";
import MatchTable from "./MatchTable";
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
    case "narendra-modi-nomination-varanasi-symbolism-strategy":
      content = (
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
      content = <MatchTable />;
      break;
    default:
      content = null;
  }

  return <>{content}</>;
};
