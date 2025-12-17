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
    "Get the latest news, articles, and insights on technology, entertainment, sports, and more at urTechy Blogs. Stay updated with trending topics.";

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
            url: `${rootUrl}/images/comp2.jpg`,
            width: 1200,
            height: 634,
            alt: "urTechy Blogs - Tech, Entertainment & Sports News",
          },
        ],
        site_name: "urTechy Blogs",
      }}
      twitter={{
        handle: "@shanuv000",
        site: "@Onlyblogs_",
        cardType: "summary_large_image",
      }}
      additionalMetaTags={[
        {
          name: "keywords",
          content:
            "tech, entertainment, sports, articles, news, updates, reviews, analysis, blog, blogging, diverse content, information, insights",
        },
        {
          name: "author",
          content: "urTechy Blogs",
        },
        {
          property: "og:locale",
          content: "en_US",
        },
        {
          name: "twitter:title",
          content: title,
        },
        {
          name: "twitter:description",
          content: description,
        },
        {
          name: "twitter:image",
          content: `${rootUrl}/images/comp2.jpg`,
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
