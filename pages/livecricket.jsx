import React from "react";
import Head from "next/head";
import ShowCricket from "../components/Cricket/ShowCricket";

/**
 * LiveCricket page component
 * Displays cricket match information in a dedicated page
 *
 * @returns {React.ReactElement} - Rendered component
 */
const LiveCricket = () => {
  return (
    <>
      <Head>
        <title>Live Cricket Scores & Updates | OnlyBlog</title>
        <meta
          name="description"
          content="Get the latest cricket scores, match updates, and tournament standings in real-time."
        />
        <meta
          name="keywords"
          content="cricket, live scores, cricket matches, tournament standings"
        />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Cricket Updates</h1>
        <ShowCricket />
      </div>
    </>
  );
};

export default LiveCricket;
