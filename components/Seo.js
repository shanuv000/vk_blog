import { NextSeo } from "next-seo";

export default function Seo({ post }) {
  const { title, excerpt, slug } = post;
  let coverImage = post.featuredImage.url;
  // console.log(post.featuredImage.url);
  return (
    <>
      <NextSeo
        title={title}
        description={excerpt}
        // canonical={`https://vk-blog.vercel.app/post/${slug}`}
        canonical={`http://www.keytosuccess.me/post/${slug}`}
        openGraph={{
          type: "website",
          url: "http://www.keytosuccess.me/",
          title: `${title} | originally posted on vk-blog.vercel.app`,
          description: excerpt,
          locale: "en_EN",
          images: [
            {
              url: { coverImage },
              width: 800,
              height: 600,
              alt: `hero image for ${title}`,
            },
          ],
          site_name: "https://www.keytosuccess.me",
        }}
        // twitter={{
        //   handle: "@shanuv000",
        //   site: "http://www.keytosuccess.me/",
        //   cardType: "summary_large_image",
        // }}
      />
    </>
  );
}
