import React from 'react';

/**
 * JsonLd component for adding structured data to pages
 * @param {Object} props - Component props
 * @param {Object} props.data - The structured data object
 * @returns {JSX.Element} - Script element with JSON-LD data
 */
const JsonLd = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

export default JsonLd;
