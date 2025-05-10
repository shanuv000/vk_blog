import { NextSeo } from "next-seo";
import { DEFAULT_FEATURED_IMAGE } from "./DefaultAvatar";

/**
 * Enhanced SEO component for blog posts
 * @param {Object} props - Component props
 * @param {Object} props.post - The post data
 * @returns {JSX.Element} - NextSeo component with optimized SEO settings
 */
export default function Seo({ post }) {
  if (!post) return null;

  const { title, excerpt, slug, featuredImage, categories } = post;
  const rootUrl = "https://blog.urtechy.com";
  const coverImageUrl = featuredImage?.url || DEFAULT_FEATURED_IMAGE;
  const postUrl = `${rootUrl}/post/${slug}`;

  // Format dates properly
  const publishedTime =
    post.publishedAt || post.createdAt || new Date().toISOString();
  const modifiedTime = post.updatedAt || post.createdAt || publishedTime;

  // Extract category names for article:section
  const primaryCategory =
    categories && categories.length > 0 ? categories[0].name : "Technology";

  // Extract tags from categories if no explicit tags
  const tags =
    post.tags || (categories ? categories.map((cat) => cat.name) : []);

  return (
    <NextSeo
      title={`${title} | urTechy Blogs`}
      description={excerpt || `Read about ${title} on urTechy Blogs`}
      canonical={postUrl}
      openGraph={{
        type: "article",
        article: {
          publishedTime: publishedTime,
          modifiedTime: modifiedTime,
          section: primaryCategory,
          tags: tags,
        },
        url: postUrl,
        title: title,
        description: excerpt || `Read about ${title} on urTechy Blogs`,
        images: [
          {
            url: coverImageUrl,
            width: 1200,
            height: 630,
            alt: `Featured image for ${title}`,
          },
        ],
        locale: "en_US",
        site_name: "urTechy Blogs",
      }}
      twitter={{
        handle: "@shanuv000",
        site: "@Onlyblogs_",
        cardType: "summary_large_image",
      }}
      additionalMetaTags={[
        {
          name: "twitter:title",
          content: title,
        },
        {
          name: "twitter:description",
          content: excerpt || `Read about ${title} on urTechy Blogs`,
        },
        {
          name: "twitter:image",
          content: coverImageUrl,
        },
      ]}
      languageAlternates={[
        {
          hrefLang: "en",
          href: postUrl,
        },
      ]}
    />
  );
}
