import React from "react";

const Navbar_post_details = ({ post }) => {
  return (
    <nav class="flex justify-center space-x-4 lg:mb-2 my-4">
      <a
        target={"_blank"}
        href={`https://twitter.com/intent/tweet?text=${post.title}&url=https://www.keytosuccess.me/post/${post.slug}&via=shanuv0000`}
        class="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900"
      >
        <img src="/twitter.svg" width={45} alt="" />
      </a>
      <a
        target={"_blank"}
        href={`https://www.facebook.com/sharer/sharer.php?u=https://www.keytosuccess.me/post/${post.slug}`}
        class="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900"
      >
        <img src="/facebook.svg" width={45} alt="" />
      </a>
      <a
        target={"_blank"}
        href={`http://www.reddit.com/submit?url=https://www.keytosuccess.me/post/${post.slug}&title=${post.title}&via=u/smattyvaibhav
`}
        class="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900"
      >
        <img src="/reddit.png" width={45} alt="" />
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
        class="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900"
      >
        <img src="/linkedin.svg" width={45} alt="" />
      </a>
      <a
        target={"_blank"}
        href={`https://www.tumblr.com/widgets/share/tool?canonicalUrl=https://www.keytosuccess.me/post/${post.slug}&title=${post.title}&caption=${post.excerpt}&tags={#key2success}`}
        class="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900 "
      >
        <img src="/tumblr.svg" width={45} alt="" />
      </a>
      <a
        target={"_blank"}
        href={`http://pinterest.com/pin/create/button/?url=https://www.keytosuccess.me/post/${post.slug}`}
        class="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900 "
      >
        <img src="/pin.svg" width={45} alt="" />
      </a>
    </nav>
  );
};

export default Navbar_post_details;
