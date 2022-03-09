import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
const Navbar_post_details = ({ post }) => {
  const slugs = post.slug.trim();
  return (
    <nav class="flex flex-row justify-center justify-center  space-x-4 lg:mb-2 my-4">
      <a
        target={"_blank"}
        href={`https://twitter.com/intent/tweet?text=${post.title}&url=https://www.keytosuccess.me/post/${post.slug}&via=shanuv0000`}
        class="	 font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100   hover:text-slate-900"
      >
        <LazyLoadImage src="/twitter.svg" width={45} alt="" />
      </a>
      <a
        target={"_blank"}
        href={`https://www.facebook.com/sharer/sharer.php?u=https://www.keytosuccess.me/post/${post.slug}`}
        class="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900"
      >
        <LazyLoadImage src="/facebook.svg" width={45} alt="" />
      </a>
      <a
        target={"_blank"}
        href={`http://www.reddit.com/submit?url=https://www.keytosuccess.me/post/${post.slug}&title=${post.title}&via=u/smattyvaibhav
`}
        class="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900 hidden lg:inline-block "
      >
        <LazyLoadImage src="/reddit.png" width={45} alt="" />
      </a>
      {/* <a
              href="/projects"
              class="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900"
            >
              <img src="/message.png" width={30} alt="" />
            </a> */}
      <a
        target={"_blank"}
        href={`https://www.linkedin.com/sharing/share-offsite/?url=https://www.keytosuccess.me/post/${post.slug}
`}
        class="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900 hidden lg:inline-block "
      >
        <LazyLoadImage
          src="/linkedin.svg"
          width={45}
          alt=""
          // className="invisible  md:visible"
        />
      </a>
      <a
        target={"_blank"}
        href={`https://www.tumblr.com/widgets/share/tool?canonicalUrl=https://www.keytosuccess.me/post/${post.slug}&title=${post.title}&caption=${post.excerpt}&tags={#key2success}`}
        class="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900 hidden lg:inline-block "
      >
        <LazyLoadImage src="/tumblr.svg" width={45} alt="" />
      </a>
      <a
        target={"_blank"}
        href={`http://pinterest.com/pin/create/button/?url=https://www.keytosuccess.me/post/${post.slug}`}
        class="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900 hidden lg:inline-block "
      >
        <LazyLoadImage src="/pin.svg" width={45} alt="" />
      </a>
      <a
        href={`https://wa.me/?text=https://www.keytosuccess.me/post/${slugs}`}
        data-action="share/whatsapp/share"
        class="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900 lg:hidden"
      >
        <LazyLoadImage src="/whatsapp2.svg" width={45} alt="" />
      </a>
      <a
        href={`https://t.me/share/url?url=https://www.keytosuccess.me/post/${slugs}&text=${post.title}`}
        class="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900 lg:hidden"
      >
        <LazyLoadImage src="/telegram.svg" width={45} alt="" />
      </a>
    </nav>
  );
};

export default Navbar_post_details;
