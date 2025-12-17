import React from "react";
import JsonLd from "./JsonLd";

/**
 * OrganizationSchema component for generating Organization structured data
 * Enhances brand visibility in Google search results and Knowledge Graph
 * @returns {JSX.Element} - JsonLd component with Organization schema
 */
const OrganizationSchema = () => {
  const rootUrl = "https://blog.urtechy.com";

  // Prepare organization schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "urTechy Blogs",
    alternateName: "urTechy",
    url: rootUrl,
    logo: {
      "@type": "ImageObject",
      url: `${rootUrl}/logo/logo4.png`,
      width: 512,
      height: 512,
    },
    description:
      "Get the latest news, articles, and insights on technology, entertainment, sports, and more at urTechy Blogs.",
    foundingDate: "2021",
    sameAs: [
      "https://twitter.com/shanuv000",
      "https://twitter.com/Onlyblogs_",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      url: `${rootUrl}/contact`,
    },
  };

  return <JsonLd data={organizationSchema} />;
};

export default OrganizationSchema;
