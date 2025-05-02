import { NextSeo } from "next-seo";

export default function Seo({ post }) {
  const { title, excerpt, slug, featuredImage } = post;
  const rootUrl = "https://blog.urtechy.com";
  const coverImageUrl = featuredImage?.url;

  return (
    <NextSeo
      title={title}
      description={excerpt}
      canonical={`${rootUrl}/post/${slug}`}
      openGraph={{
        type: "article",
        article: {
          publishedTime: post.date || new Date().toISOString(),
          modifiedTime: post.createdAt || post.date || new Date().toISOString(),
          tags: post.tags || [],
        },
        url: `${rootUrl}/post/${slug}`,
        title: title,
        description: excerpt,
        images: coverImageUrl
          ? [
              {
                url: coverImageUrl,
                width: 800, // Ideally fetch actual dimensions
                height: 600, // Ideally fetch actual dimensions
                alt: `Hero image for ${title}`,
              },
            ]
          : [
              {
                url: `${rootUrl}/logo/logo4.png`,
                width: 573,
                height: 600,
                alt: "urTechy Blogs Logo",
              },
            ], // Fallback image URL
        locale: "en_US", // Update with your locale
        site_name: "urTechy Blogs", // Update with your actual blog name
      }}
      twitter={{
        handle: "@shanuv000",
        site: "@Onlyblogs_",
        cardType: "summary_large_image",
      }}
    />
  );
}
