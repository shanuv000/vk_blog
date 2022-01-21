import { NextSeo } from "next-seo";

export default function Seo({ post }) {
  const { title, excerpt, slug, coverImage } = post;
  return (
    <>
      <NextSeo
        title={title}
        description={excerpt}
        canonical={`https://vk-blog.vercel.app/post/${slug}`}
        openGraph={{
          type: "website",
          url: "https://vk-blog.vercel.app",
          title: `${title} | originally posted on vk-blog.vercel.app`,
          description: excerpt,
          locale: "en_EN",
          images: [
            {
              url: post.featuredImage.url,
              width: 800,
              height: 600,
              alt: `hero image for ${title}`,
            },
          ],
          site_name: "vk-blog.vercel.app",
        }}
        twitter={{
          handle: "@shanuv000",
          site: `https://vk-blog.vercel.app/post/${slug}`,
          cardType: "summary",
        }}
      />
    </>
  );
}
