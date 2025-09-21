import React from "react";
import moment from "moment";
import Link from "next/link";
import Image from "next/image";
import { DEFAULT_AVATAR, DEFAULT_FEATURED_IMAGE } from "./DefaultAvatar";
import { FaUser, FaCalendarAlt } from "react-icons/fa";
import OptimizedImage from "./OptimizedImage";
import { PostCardImageSkeleton } from "./ImageSkeletons";

const PostCard = ({ post = {} }) => {
  // Ensure post has all required properties with defaults
  const safePost = {
    slug: post.slug || "post",
    title: post.title || "Untitled Post",
    excerpt: post.excerpt || "Read this article to learn more...",
    createdAt: post.createdAt || null,
    publishedAt: post.publishedAt || null,
    featuredImage: post.featuredImage || { url: DEFAULT_FEATURED_IMAGE },
    author: post.author || {
      name: "Anonymous",
      photo: { url: DEFAULT_AVATAR },
    },
  };

  return (
    <div className="bg-secondary rounded-lg overflow-hidden shadow-lg mb-8 transition-all duration-300 hover:shadow-xl hover:transform hover:-translate-y-1">
      <div className="relative overflow-hidden">
        {safePost.featuredImage?.url ? (
          <Link href={`/post/${safePost.slug}`}>
            <div className="w-full aspect-[16/9] group">
              <OptimizedImage
                src={safePost.featuredImage.url}
                alt={safePost.title || "Featured image"}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                quality={80}
                priority={false}
                fallbackSrc={DEFAULT_FEATURED_IMAGE}
                showSkeleton={true}
                aspectRatio="16/9"
                containerClassName="w-full h-full"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSJyZ2JhKDE1NiwgMTYzLCAxNzUsIDAuMSkiLz48L3N2Zz4="
                onLoad={() => {
                  // Optional: Add performance tracking
                }}
                onError={(error) => {
                  console.warn("Post card image failed to load:", error);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary to-transparent opacity-50"></div>
            </div>
          </Link>
        ) : (
          <div className="w-full aspect-[16/9] bg-secondary-light flex items-center justify-center">
            <p className="text-text-secondary">No image available</p>
          </div>
        )}

        {/* Date badge */}
        <div className="absolute top-4 right-4 bg-primary text-white text-sm px-3 py-1 rounded-full shadow-md flex items-center">
          <FaCalendarAlt className="mr-1" size={12} />
          <span suppressHydrationWarning>
            {safePost.createdAt
              ? moment(safePost.createdAt).format("MMM DD, YYYY")
              : safePost.publishedAt
              ? moment(safePost.publishedAt).format("MMM DD, YYYY")
              : "No date"}
          </span>
        </div>
      </div>

      <div className="p-6">
        <Link href={`/post/${safePost.slug}`}>
          <h2 className="text-xl md:text-2xl font-heading font-semibold mb-4 text-text-primary hover:text-primary transition-colors duration-200">
            {safePost.title}
          </h2>
        </Link>

        <p className="text-text-secondary mb-6 line-clamp-3">
          {safePost.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {safePost.author?.photo?.url ? (
              <Image
                alt={safePost.author.name || "Author"}
                height={36}
                width={36}
                className="rounded-full border-2 border-primary"
                src={safePost.author.photo.url}
                onError={() => {
                  console.log(
                    "Author image load error in PostCard, using fallback"
                  );
                  // Next.js Image component will use the fallback defined in next.config.js
                }}
              />
            ) : (
              <div className="flex items-center justify-center bg-secondary-light rounded-full h-[36px] w-[36px] border-2 border-primary">
                <FaUser className="text-text-secondary" size={16} />
              </div>
            )}
            <p className="ml-2 text-text-secondary font-medium">
              {safePost.author?.name || "Anonymous"}
            </p>
          </div>

          <Link href={`/post/${safePost.slug}`}>
            <span className="inline-block bg-primary text-white px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 hover:bg-primary-dark hover:scale-105 hover:shadow-lg">
              Read More
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
