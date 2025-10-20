/**
 * Tweet Embed Configuration
 * Optimized settings for the best user experience with Twitter embeds
 */

export const TWEET_EMBED_CONFIG = {
  // Performance optimizations
  performance: {
    // Lazy load embeds when they're near the viewport
    lazyLoad: true,
    // Distance from viewport to start loading (pixels)
    lazyLoadMargin: "200px",
    // Intersection observer threshold
    intersectionThreshold: 0.1,
    // Enable request deduplication for same tweet IDs
    deduplicateRequests: true,
    // Cache duration for tweet data (milliseconds)
    cacheDuration: 5 * 60 * 1000, // 5 minutes
  },

  // API configuration
  api: {
    // Use custom API endpoint for better control
    useCustomApi: true,
    // Endpoint path
    endpoint: "/api/twitter/tweet",
    // Request timeout (milliseconds)
    timeout: 8000,
    // Enable retry on failure
    enableRetry: true,
    // Maximum retry attempts
    maxRetries: 2,
    // Retry delay (milliseconds)
    retryDelay: 1000,
  },

  // Rendering options
  rendering: {
    // Use modern TwitterPost component (custom styled)
    useModernComponent: true,
    // Fallback to legacy Twitter embed widget if API fails
    enableLegacyFallback: true,
    // Show loading skeleton while fetching
    showLoadingSkeleton: true,
    // Show error states gracefully
    showErrorState: true,
    // Enable dark mode support
    darkModeSupport: false,
  },

  // Layout configuration
  layout: {
    // Maximum width for tweet embeds (pixels)
    maxWidth: 550,
    // Center align tweets
    centerAlign: true,
    // Add spacing around embeds
    verticalSpacing: "2rem",
    // Responsive breakpoints
    breakpoints: {
      mobile: 640,
      tablet: 768,
      desktop: 1024,
    },
  },

  // User experience enhancements
  ux: {
    // Smooth scroll to embed on error retry
    smoothScrollOnRetry: true,
    // Show tweet metadata (likes, retweets, etc.)
    showMetadata: true,
    // Enable link previews in tweets
    showLinkPreviews: true,
    // Show conversation thread context
    showThreadContext: false,
    // Enable analytics tracking
    enableAnalytics: false,
  },

  // Accessibility
  accessibility: {
    // Add ARIA labels
    addAriaLabels: true,
    // Enable keyboard navigation
    keyboardNavigation: true,
    // Announce loading states to screen readers
    announceLoadingStates: true,
    // Add skip links for embed content
    addSkipLinks: false,
  },

  // Error handling
  errorHandling: {
    // Show friendly error messages
    showFriendlyErrors: true,
    // Log errors to console (development only)
    logErrors: process.env.NODE_ENV === "development",
    // Provide retry button on error
    showRetryButton: true,
    // Auto-retry on rate limit after delay
    autoRetryOnRateLimit: true,
    // Rate limit retry delay (milliseconds)
    rateLimitRetryDelay: 60000, // 1 minute
  },

  // Content policy
  content: {
    // Hide sensitive content by default
    hideSensitiveContent: false,
    // Show content warnings
    showContentWarnings: true,
    // Filter out specific content types
    contentFilter: [],
  },

  // Embed variants
  variants: {
    // Default variant for post detail pages
    postDetail: {
      variant: "card",
      showFullThread: false,
      expandMedia: true,
      showEngagement: true,
    },
    // Inline variant for content
    inline: {
      variant: "inline",
      compact: false,
      showQuotedTweets: true,
    },
    // Compact variant for sidebars
    compact: {
      variant: "compact",
      hideMedia: false,
      showMinimalMetadata: true,
    },
  },

  // Modern, simple theme colors
  theme: {
    // Light mode (default)
    light: {
      // Background colors
      background: "#ffffff",
      backgroundHover: "#f9fafb",
      skeletonBase: "#f3f4f6",
      skeletonHighlight: "#e5e7eb",

      // Border colors
      border: "#e5e7eb",
      borderHover: "#d1d5db",

      // Text colors
      textPrimary: "#111827",
      textSecondary: "#6b7280",
      textMuted: "#9ca3af",

      // Accent colors (modern blue)
      accent: "#3b82f6",
      accentHover: "#2563eb",
      accentLight: "#dbeafe",

      // Error colors (soft red)
      error: "#ef4444",
      errorBackground: "#fef2f2",
      errorBorder: "#fecaca",

      // Success colors (soft green)
      success: "#10b981",
      successBackground: "#f0fdf4",

      // Interactive elements
      buttonBackground: "#ffffff",
      buttonBorder: "#e5e7eb",
      buttonHover: "#f9fafb",
      buttonText: "#374151",
    },

    // Dark mode (optional - keeping it simple and modern)
    dark: {
      background: "#1f2937",
      backgroundHover: "#374151",
      skeletonBase: "#374151",
      skeletonHighlight: "#4b5563",

      border: "#374151",
      borderHover: "#4b5563",

      textPrimary: "#f9fafb",
      textSecondary: "#d1d5db",
      textMuted: "#9ca3af",

      accent: "#60a5fa",
      accentHover: "#3b82f6",
      accentLight: "#1e3a8a",

      error: "#f87171",
      errorBackground: "#7f1d1d",
      errorBorder: "#991b1b",

      success: "#34d399",
      successBackground: "#064e3b",

      buttonBackground: "#374151",
      buttonBorder: "#4b5563",
      buttonHover: "#4b5563",
      buttonText: "#f9fafb",
    },
  },
};

/**
 * Get configuration for specific context
 * @param {string} context - The context (postDetail, inline, compact)
 * @param {string} theme - The theme mode (light, dark)
 * @returns {object} Merged configuration
 */
export function getTweetEmbedConfig(context = "postDetail", theme = "light") {
  return {
    ...TWEET_EMBED_CONFIG,
    ...TWEET_EMBED_CONFIG.variants[context],
    colors: TWEET_EMBED_CONFIG.theme[theme],
  };
}

/**
 * Validate tweet ID format
 * @param {string|number} tweetId - Tweet ID to validate
 * @returns {boolean} Whether the tweet ID is valid
 */
export function isValidTweetId(tweetId) {
  if (!tweetId) {return false;}
  const cleanId = tweetId.toString().trim();
  return /^\d{10,}$/.test(cleanId); // Twitter IDs are 10+ digits
}

/**
 * Extract tweet ID from various formats
 * @param {string} input - URL or tweet ID
 * @returns {string|null} Extracted tweet ID or null
 */
export function extractTweetId(input) {
  if (!input) {return null;}

  // Already a clean ID
  if (isValidTweetId(input)) {
    return input.toString().trim();
  }

  // Extract from URL patterns
  const patterns = [
    /twitter\.com\/\w+\/status\/(\d+)/,
    /x\.com\/\w+\/status\/(\d+)/,
    /\/status\/(\d+)/,
    /tweet\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1] && isValidTweetId(match[1])) {
      return match[1];
    }
  }

  return null;
}

/**
 * Generate skeleton loader for tweet embed
 * @returns {JSX.Element} Skeleton component
 */
export function getTweetSkeleton() {
  return {
    className: "w-full max-w-[550px] mx-auto",
    content: [
      { type: "avatar", className: "w-12 h-12 bg-gray-200 rounded-full" },
      { type: "text", className: "h-4 bg-gray-200 rounded w-32" },
      { type: "text", className: "h-3 bg-gray-100 rounded w-24" },
      { type: "content", className: "h-3 bg-gray-100 rounded" },
      { type: "media", className: "h-48 bg-gray-100 rounded-lg" },
      { type: "actions", className: "h-4 w-16 bg-gray-100 rounded" },
    ],
  };
}

export default TWEET_EMBED_CONFIG;
