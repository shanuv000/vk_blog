import React from "react";
import PropTypes from "prop-types";
import { LazyLoadImage } from "react-lazy-load-image-component";

const NavbarPostDetails = ({ post }) => {
  const slugs = post.slug.trim();
  const rootUrl = "https://onlyblog.vercel.app";

  return (
    <nav className="flex flex-row justify-center space-x-4 lg:mb-2 my-4">
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`https://twitter.com/intent/tweet?text=${post.title}&url=${rootUrl}/post/${post.slug}&via=Onlyblogs_`}
        className="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900"
      >
        <LazyLoadImage src="/twitter.svg" width={45} alt="Share on Twitter" />
      </a>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`https://www.facebook.com/sharer/sharer.php?u=${rootUrl}/post/${post.slug}`}
        className="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900"
      >
        <LazyLoadImage src="/facebook.svg" width={45} alt="Share on Facebook" />
      </a>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`http://www.reddit.com/submit?url=${rootUrl}/post/${post.slug}&title=${post.title}&via=u/smattyvaibhav`}
        className="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900 hidden lg:inline-block"
      >
        <LazyLoadImage src="/reddit.png" width={45} alt="Share on Reddit" />
      </a>
      <a
        href={`https://wa.me/?text=${rootUrl}/post/${slugs}`}
        data-action="share/whatsapp/share"
        className="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900"
      >
        <LazyLoadImage
          src="/whatsapp2.svg"
          width={45}
          alt="Share on WhatsApp"
        />
      </a>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${rootUrl}/post/${post.slug}`}
        className="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900 hidden lg:inline-block"
      >
        <LazyLoadImage src="/linkedin.svg" width={45} alt="Share on LinkedIn" />
      </a>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`http://pinterest.com/pin/create/button/?url=${rootUrl}/post/${post.slug}`}
        className="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900 hidden lg:inline-block"
      >
        <LazyLoadImage src="/pin.svg" width={45} alt="Share on Pinterest" />
      </a>
      <a
        href={`https://t.me/share/url?url=${rootUrl}/post/${slugs}&text=${post.title}`}
        className="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900 lg:hidden"
      >
        <LazyLoadImage src="/telegram.svg" width={45} alt="Share on Telegram" />
      </a>
    </nav>
  );
};

NavbarPostDetails.propTypes = {
  post: PropTypes.shape({
    title: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
  }).isRequired,
};

export default NavbarPostDetails;
