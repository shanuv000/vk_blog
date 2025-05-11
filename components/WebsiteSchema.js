import React from "react";
import JsonLd from "./JsonLd";

/**
 * WebsiteSchema component for generating WebSite schema structured data
 * @returns {JSX.Element} - JsonLd component with WebSite schema
 */
const WebsiteSchema = () => {
  const rootUrl = "https://blog.urtechy.com";

  // Prepare website schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "urTechy Blogs",
    url: rootUrl,
    description:
      "Get the latest news, articles, and insights on technology, entertainment, sports, and more at urTechy Blogs.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${rootUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return <JsonLd data={websiteSchema} />;
};

export default WebsiteSchema;
