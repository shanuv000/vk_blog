import React from "react";
import Image from "next/image";
import moment from "moment";
import Link from "next/link";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { DEFAULT_AVATAR } from "./DefaultAvatar";
import { FaUser } from "react-icons/fa";

const PostCard = ({ post }) => (
  <div className="bg-white shadow-lg rounded-lg p-0 lg:p-8 pb-12 mb-8 overflow-hidden">
    <div className="relative shadow-md mb-6 overflow-hidden rounded-t-lg lg:rounded-lg">
      {post.featuredImage?.url ? (
        <div
          className="w-full"
          style={{ maxHeight: "500px", overflow: "hidden" }}
        >
          <LazyLoadImage
            src={post.featuredImage.url}
            alt={post.title || "Featured image"}
            effect="blur"
            width={800}
            height={600}
            className="w-full"
            wrapperClassName="w-full"
            style={{ width: "100%", objectFit: "cover" }}
            placeholderSrc="/placeholder-image.jpg"
          />
        </div>
      ) : (
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500">No image available</p>
        </div>
      )}
    </div>

    <h1 className="transition duration-700 text-center mb-8 cursor-pointer hover:text-pink-600 text-3xl font-semibold">
      <Link href={`/post/${post.slug}`}>{post.title}</Link>
    </h1>
    <div className="block lg:flex text-center items-center justify-center mb-8 w-full">
      <div className="flex items-center justify-center mb-4 lg:mb-0 w-full lg:w-auto mr-8">
        {post.author?.photo?.url ? (
          <Image
            alt={post.author.name || "Author"}
            height={30}
            width={30}
            className="align-middle rounded-full"
            src={post.author.photo.url}
          />
        ) : (
          <div className="flex items-center justify-center bg-gray-200 rounded-full h-[30px] w-[30px]">
            <FaUser className="text-gray-500" size={16} />
          </div>
        )}
        <p className="inline align-middle text-gray-700 ml-2 font-medium text-lg">
          {post.author?.name || "Anonymous"}
        </p>
      </div>
      <div className="font-medium text-gray-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 inline mr-2 text-pink-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="align-middle">
          {post.createdAt
            ? moment(post.createdAt).format("MMM DD, YYYY")
            : post.publishedAt
            ? moment(post.publishedAt).format("MMM DD, YYYY")
            : "No date"}
        </span>
      </div>
    </div>
    <p className="text-center text-lg text-gray-700 font-normal px-4 lg:px-20 mb-8 truncate md:text-clip">
      {post.excerpt || "Read this article to learn more..."}
    </p>
    <div className="text-center">
      <Link href={`/post/${post.slug}`}>
        <span className="transition duration-500 ease transform hover:-translate-y-1 inline-block bg-pink-600 text-lg font-medium rounded-full text-white px-8 py-3 cursor-pointer">
          Continue Reading
        </span>
      </Link>
    </div>
  </div>
);

export default PostCard;
