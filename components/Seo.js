import { NextSeo } from "next-seo";

export default function Seo({ post }) {
  const { title, excerpt, slug, featuredImage } = post;
  const rootUrl = "https://onlyblog.vercel.app";
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
                url: "https://firebasestorage.googleapis.com/v0/b/shanu-chess.appspot.com/o/Portfolio%20work%2Fs.png?alt=media&token=ea44c393-6f7d-470c-9750-a707100affb1",
              },
            ], // Fallback image URL
        locale: "en_US", // Update with your locale
        site_name: "Only Blog", // Update with your actual blog name
      }}
      twitter={{
        handle: "@shanuv000",
        site: "@Onlyblogs_",
        cardType: "summary_large_image",
      }}
    />
  );
}
