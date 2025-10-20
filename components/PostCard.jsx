import React from "react";
import moment from "moment";
import Link from "next/link";
import Image from "next/image";
import { DEFAULT_AVATAR, DEFAULT_FEATURED_IMAGE } from "./DefaultAvatar";
import { FaUser, FaCalendarAlt } from "react-icons/fa";
import OptimizedImage from "./OptimizedImage";
import { PostCardImageSkeleton } from "./ImageSkeletons";
import TagBadge from "./TagBadge";
import { IMAGE_CONFIGS, getOptimizedImageUrl } from "../lib/image-config";

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
    <article className="group bg-secondary rounded-xl overflow-hidden border border-border shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1">
      <div className="relative overflow-hidden">
        {safePost.featuredImage?.url ? (
          <Link href={`/post/${safePost.slug}`}>
            <div className="w-full aspect-[16/9] bg-secondary-light">
              <OptimizedImage
                src={getOptimizedImageUrl(
                  safePost.featuredImage.url,
                  "postCard"
                )}
                alt={safePost.title || "Featured image"}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                {...IMAGE_CONFIGS.postCard}
                fallbackSrc={DEFAULT_FEATURED_IMAGE}
                showSkeleton={true}
                aspectRatio="16/9"
                containerClassName="w-full h-full"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSJyZ2JhKDI1LCAyNSwgMjUsIDEpIi8+PC9zdmc+"
                onLoad={() => {
                  // Optional: Add performance tracking
                }}
                onError={(error) => {
                  console.warn("Post card image failed to load:", error);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
          </Link>
        ) : (
          <div className="w-full aspect-[16/9] bg-secondary-light flex items-center justify-center">
            <p className="text-text-tertiary">No image available</p>
          </div>
        )}

        {/* Date badge - minimal design */}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          <FaCalendarAlt size={10} />
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
          <h2 className="text-xl md:text-2xl font-heading font-bold mb-3 text-text-primary group-hover:text-primary transition-colors duration-200 line-clamp-2">
            {safePost.title}
          </h2>
        </Link>

        <p className="text-text-secondary mb-5 line-clamp-3 leading-relaxed">
          {safePost.excerpt}
        </p>

        {/* Tags Section */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <TagBadge key={tag.id} tag={tag} size="sm" />
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-text-tertiary px-2 py-1">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center">
            {safePost.author?.photo?.url ? (
              <Image
                alt={safePost.author.name || "Author"}
                height={36}
                width={36}
                className="rounded-full ring-2 ring-border"
                src={getOptimizedImageUrl(safePost.author.photo.url, "avatar")}
                quality={70}
                sizes="36px"
                onError={() => {
                  console.log(
                    "Author image load error in PostCard, using fallback"
                  );
                }}
              />
            ) : (
              <div className="flex items-center justify-center bg-secondary-light rounded-full h-[36px] w-[36px] ring-2 ring-border">
                <FaUser className="text-text-tertiary" size={14} />
              </div>
            )}
            <p className="ml-3 text-sm text-text-secondary font-medium">
              {safePost.author?.name || "Anonymous"}
            </p>
          </div>

          <Link href={`/post/${safePost.slug}`}>
            <span className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:bg-primary-dark hover:shadow-glow-sm">
              Read More
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
