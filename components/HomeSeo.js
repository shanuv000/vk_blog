import { NextSeo } from "next-seo";
import Head from "next/head";

/**
 * HomeSeo component for homepage SEO optimization with pagination support
 * @param {Object} props - Component props
 * @param {Array} props.featuredPosts - Featured posts for rich snippets (optional)
 * @param {number} props.currentPage - Current page number (default: 1)
 * @param {number} props.totalPages - Total number of pages (default: 1)
 * @returns {JSX.Element} - NextSeo component with homepage SEO settings
 */
const HomeSeo = ({ featuredPosts = [], currentPage = 1, totalPages = 1 }) => {
  const rootUrl = "https://blog.urtechy.com";
  const isPageOne = currentPage === 1;
  
  // Adjust title for paginated pages
  const baseTitle = "urTechy Blogs | Tech, Entertainment & Sports News";
  const title = isPageOne
    ? baseTitle
    : `${baseTitle} - Page ${currentPage}`;
  
  const description =
    "Get the latest news, articles, and insights on technology, entertainment, sports, and more at urTechy Blogs. Stay updated with trending topics.";

  // Canonical URL - page 1 is root, others are /page/N
  const canonicalUrl = isPageOne
    ? rootUrl
    : `${rootUrl}/page/${currentPage}`;

  // Prev/next URLs for pagination SEO
  const prevUrl = currentPage > 1
    ? (currentPage === 2 ? rootUrl : `${rootUrl}/page/${currentPage - 1}`)
    : null;
  const nextUrl = currentPage < totalPages
    ? `${rootUrl}/page/${currentPage + 1}`
    : null;

  return (
    <>
      {/* Pagination link tags for SEO */}
      <Head>
        {prevUrl && <link rel="prev" href={prevUrl} />}
        {nextUrl && <link rel="next" href={nextUrl} />}
      </Head>

      <NextSeo
        title={title}
        description={description}
        canonical={canonicalUrl}
        openGraph={{
          type: "website",
          url: canonicalUrl,
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
          // Add robots noindex for deep pagination pages (optional - prevents thin content issues)
          ...(currentPage > 10
            ? [
                {
                  name: "robots",
                  content: "noindex, follow",
                },
              ]
            : []),
        ]}
        languageAlternates={[
          {
            hrefLang: "en",
            href: canonicalUrl,
          },
        ]}
      />
    </>
  );
};

export default HomeSeo;
