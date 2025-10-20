import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { SocialSharing } from "./SocialSharing";
import TweetEmbedder from "./TweetEmbedder";
import TwitterEmbed from "./TwitterEmbed";
import RichTextRenderer from "../RichTextRenderer";

// Error fallback components
const SharingFallback = ({ error }) => (
  <div className="my-6 p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
    <p className="text-gray-500">Social sharing temporarily unavailable</p>
    {process.env.NODE_ENV === "development" && (
      <p className="text-xs text-gray-400 mt-2">{error?.message}</p>
    )}
  </div>
);

const SharingLoader = () => (
  <div className="my-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
    <div className="animate-pulse">
      <div className="text-center mb-4">
        <div className="h-6 bg-gray-200 rounded w-32 mx-auto mb-2" />
        <div className="h-4 bg-gray-200 rounded w-48 mx-auto" />
      </div>
      <div className="flex justify-center gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-12 h-12 bg-gray-200 rounded-full" />
        ))}
      </div>
    </div>
  </div>
);

const TweetEmbedderFallback = ({ error }) => (
  <div className="hidden">
    {/* TweetEmbedder errors are handled silently */}
    {process.env.NODE_ENV === "development" && (
      <div className="text-xs text-red-400 p-2">
        TweetEmbedder error: {error?.message}
      </div>
    )}
  </div>
);

/**
 * Example blog post component showing proper integration of Blog components
 * This demonstrates the recommended way to integrate social media functionality
 */
const BlogPostExample = ({ post }) => {
  // Validate post data
  if (!post) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-gray-500">
          <p>Post not found</p>
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto">
      {/* Post Header */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>
        
        {post.excerpt && (
          <p className="text-lg text-gray-600 mb-6">
            {post.excerpt}
          </p>
        )}

        {/* Author and Date Info */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          {post.author && (
            <span className="mr-4">
              By {post.author.name || "Anonymous"}
            </span>
          )}
          {post.createdAt && (
            <span>
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </span>
          )}
        </div>

        {/* Featured Image */}
        {post.featuredImage?.url && (
          <div className="mb-8">
            <img
              src={post.featuredImage.url}
              alt={post.title}
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>
        )}
      </header>

      {/* Social Sharing - Top */}
      <ErrorBoundary fallback={SharingFallback}>
        <Suspense fallback={<SharingLoader />}>
          <SocialSharing post={post} />
        </Suspense>
      </ErrorBoundary>

      {/* Blog Content */}
      <div className="blog-content prose prose-lg max-w-none">
        {/* Tweet Embedder - Include once per blog post page */}
        <ErrorBoundary fallback={TweetEmbedderFallback}>
          <TweetEmbedder />
        </ErrorBoundary>

        {/* Main Content */}
        {post.content ? (
          <RichTextRenderer 
            content={post.content.json || post.content} 
            references={post.content.references || []} 
          />
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>No content available</p>
          </div>
        )}

        {/* Example of direct Twitter embed usage */}
        {/* Uncomment to use direct TwitterEmbed component */}
        {/*
        <div className="my-8">
          <h3>Featured Tweet</h3>
          <TwitterEmbed tweetId="1790555395041472948" />
        </div>
        */}
      </div>

      {/* Social Sharing - Bottom */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <ErrorBoundary fallback={SharingFallback}>
          <Suspense fallback={<SharingLoader />}>
            <SocialSharing post={post} />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Categories and Tags */}
      {(post.categories?.length > 0 || post.tags?.length > 0) && (
        <footer className="mt-8 pt-6 border-t border-gray-200">
          {post.categories?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Categories:</h4>
              <div className="flex flex-wrap gap-2">
                {post.categories.map((category) => (
                  <span
                    key={category.slug || category.name}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {post.tags?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Tags:</h4>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag.slug || tag.name}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </footer>
      )}
    </article>
  );
};

// PropTypes for better development experience
BlogPostExample.propTypes = {
  post: PropTypes.shape({
    title: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    excerpt: PropTypes.string,
    content: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.shape({
        json: PropTypes.object,
        references: PropTypes.array
      })
    ]),
    featuredImage: PropTypes.shape({
      url: PropTypes.string
    }),
    author: PropTypes.shape({
      name: PropTypes.string
    }),
    createdAt: PropTypes.string,
    categories: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        slug: PropTypes.string
      })
    ),
    tags: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        slug: PropTypes.string
      })
    )
  }).isRequired
};

export default BlogPostExample;
