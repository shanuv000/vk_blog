import React from "react";
import Head from "next/head";

/**
 * JsonLd component for adding structured data to pages
 * @param {Object} props - Component props
 * @param {Object} props.data - The structured data object
 * @returns {JSX.Element} - Script element with JSON-LD data wrapped in Head
 */
const JsonLd = ({ data }) => {
  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    </Head>
  );
};

export default JsonLd;
