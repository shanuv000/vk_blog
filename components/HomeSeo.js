import { NextSeo } from "next-seo";

/**
 * HomeSeo component for homepage SEO optimization
 * @param {Object} props - Component props
 * @param {Array} props.featuredPosts - Featured posts for rich snippets (optional)
 * @returns {JSX.Element} - NextSeo component with homepage SEO settings
 */
const HomeSeo = ({ featuredPosts = [] }) => {
  const rootUrl = "https://blog.urtechy.com";
  const title = "urTechy Blogs | Tech, Entertainment & Sports News";
  const description = 
    "Get the latest news, articles, and insights on technology, entertainment, sports, and more at urTechy Blogs. Stay updated with trending topics and expert analysis.";

  return (
    <NextSeo
      title={title}
      description={description}
      canonical={rootUrl}
      openGraph={{
        type: "website",
        url: rootUrl,
        title: title,
        description: description,
        images: [
          {
            url: `${rootUrl}/logo/logo4.png`,
            width: 573,
            height: 600,
            alt: "urTechy Blogs Logo",
          },
        ],
        site_name: "urTechy Blogs",
      }}
      twitter={{
        handle: "@shanuv000",
        site: "@Onlyblogs_",
        cardType: "summary",
      }}
      additionalMetaTags={[
        {
          name: "keywords",
          content: "tech, entertainment, sports, articles, news, updates, reviews, analysis, blog, blogging, diverse content, information, insights",
        },
        {
          name: "author",
          content: "urTechy Blogs",
        },
        {
          property: "og:locale",
          content: "en_US",
        },
      ]}
      languageAlternates={[
        {
          hrefLang: "en",
          href: rootUrl,
        },
      ]}
    />
  );
};

export default HomeSeo;
