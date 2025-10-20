import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import {
  getTweetEmbedConfig,
  isValidTweetId,
  extractTweetId,
} from "../../lib/tweet-embed-config";
import ErrorBoundary from "../ErrorBoundary";

// Dynamically import TwitterPost with optimized loading
const TwitterPost = dynamic(() => import("../TwitterPost"), {
  loading: () => <TweetSkeleton />,
  ssr: false,
});

// Skeleton loader component
const TweetSkeleton = ({ colors }) => {
  const defaultColors = colors || {
    background: "#ffffff",
    border: "#e5e7eb",
    skeletonBase: "#f3f4f6",
    skeletonHighlight: "#e5e7eb",
  };

  return (
    <div
      className="w-full max-w-[550px] mx-auto rounded-2xl p-4 animate-pulse"
      style={{
        backgroundColor: defaultColors.background,
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: defaultColors.border,
      }}
    >
      <div className="flex items-start space-x-3 mb-3">
        <div
          className="w-12 h-12 rounded-full flex-shrink-0"
          style={{ backgroundColor: defaultColors.skeletonBase }}
        ></div>
        <div className="flex-1 space-y-2">
          <div
            className="h-4 rounded w-32"
            style={{ backgroundColor: defaultColors.skeletonBase }}
          ></div>
          <div
            className="h-3 rounded w-24"
            style={{ backgroundColor: defaultColors.skeletonHighlight }}
          ></div>
        </div>
      </div>
      <div className="space-y-2 mb-3">
        <div
          className="h-3 rounded"
          style={{ backgroundColor: defaultColors.skeletonHighlight }}
        ></div>
        <div
          className="h-3 rounded w-5/6"
          style={{ backgroundColor: defaultColors.skeletonHighlight }}
        ></div>
        <div
          className="h-3 rounded w-4/5"
          style={{ backgroundColor: defaultColors.skeletonHighlight }}
        ></div>
      </div>
      <div
        className="h-48 rounded-lg mb-3"
        style={{ backgroundColor: defaultColors.skeletonHighlight }}
      ></div>
      <div className="flex justify-between px-2">
        <div
          className="h-4 w-16 rounded"
          style={{ backgroundColor: defaultColors.skeletonHighlight }}
        ></div>
        <div
          className="h-4 w-16 rounded"
          style={{ backgroundColor: defaultColors.skeletonHighlight }}
        ></div>
        <div
          className="h-4 w-16 rounded"
          style={{ backgroundColor: defaultColors.skeletonHighlight }}
        ></div>
      </div>
    </div>
  );
};

// Error fallback component
const TweetError = ({ error, tweetId, onRetry, colors }) => {
  const defaultColors = colors || {
    errorBackground: "#fef2f2",
    border: "#fecaca",
    textPrimary: "#111827",
    textSecondary: "#6b7280",
    textMuted: "#9ca3af",
    buttonBackground: "#ffffff",
    buttonBorder: "#e5e7eb",
    buttonHover: "#f9fafb",
    buttonText: "#374151",
    accent: "#3b82f6",
    accentHover: "#2563eb",
  };

  return (
    <div
      className="w-full max-w-[550px] mx-auto rounded-2xl p-6 text-center"
      style={{
        backgroundColor: defaultColors.errorBackground,
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: defaultColors.border,
      }}
    >
      <div className="mb-4">
        <svg
          className="mx-auto h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
          style={{ color: defaultColors.textMuted }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3
        className="text-sm font-medium mb-1"
        style={{ color: defaultColors.textPrimary }}
      >
        Unable to load tweet
      </h3>
      <p
        className="text-xs mb-4"
        style={{ color: defaultColors.textSecondary }}
      >
        {error ||
          "This tweet may have been deleted or is temporarily unavailable"}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-3 py-1.5 shadow-sm text-xs font-medium rounded-md transition-colors"
          style={{
            backgroundColor: defaultColors.buttonBackground,
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: defaultColors.buttonBorder,
            color: defaultColors.buttonText,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = defaultColors.buttonHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              defaultColors.buttonBackground;
          }}
        >
          <svg
            className="mr-1.5 h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Try Again
        </button>
      )}
      {tweetId && (
        <div className="mt-3">
          <a
            href={`https://twitter.com/i/status/${tweetId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs hover:underline transition-colors"
            style={{
              color: defaultColors.accent,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = defaultColors.accentHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = defaultColors.accent;
            }}
          >
            View on Twitter →
          </a>
        </div>
      )}
    </div>
  );
};

/**
 * Enhanced Tweet Embed Component
 * Provides optimized tweet embedding with best practices for UX
 *
 * @param {object} props
 * @param {string|number} props.tweetId - Tweet ID or URL
 * @param {string} props.variant - Display variant (card, inline, compact)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showError - Show error states
 * @param {boolean} props.showSkeleton - Show loading skeleton
 * @param {function} props.onLoad - Callback when tweet loads
 * @param {function} props.onError - Callback when error occurs
 */
const EnhancedTweetEmbed = ({
  tweetId: rawTweetId,
  variant = "card",
  className = "",
  showError = true,
  showSkeleton = true,
  onLoad,
  onError,
  theme = "light",
  ...props
}) => {
  const [retryCount, setRetryCount] = React.useState(0);
  const config = getTweetEmbedConfig(
    variant === "inline" ? "inline" : "postDetail",
    theme
  );

  // Extract and validate tweet ID
  const tweetId = extractTweetId(rawTweetId);

  if (!tweetId || !isValidTweetId(tweetId)) {
    if (!showError) return null;

    return (
      <div className={`flex justify-center my-6 ${className}`}>
        <TweetError
          error="Invalid tweet ID or URL"
          tweetId={rawTweetId}
          colors={config.colors}
        />
      </div>
    );
  }

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  const handleError = (error) => {
    if (config.errorHandling.logErrors) {
      console.error("Tweet embed error:", error);
    }
    if (onError) {
      onError(error);
    }
  };

  return (
    <div
      className={`flex justify-center my-6 ${className}`}
      role="complementary"
      aria-label={`Tweet ${tweetId}`}
    >
      <ErrorBoundary
        fallback={
          showError ? (
            <TweetError
              error="Failed to render tweet"
              tweetId={tweetId}
              onRetry={
                config.errorHandling.showRetryButton ? handleRetry : null
              }
              colors={config.colors}
            />
          ) : null
        }
        onError={handleError}
      >
        <Suspense
          fallback={
            showSkeleton ? <TweetSkeleton colors={config.colors} /> : null
          }
        >
          <TwitterPost
            tweetId={tweetId}
            variant={variant}
            className="w-full"
            key={`${tweetId}-${retryCount}`}
            {...props}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default EnhancedTweetEmbed;
