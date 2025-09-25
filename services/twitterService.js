import { TwitterApi } from "twitter-api-v2";

// Initialize Twitter API client
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// Get read-only client
const twitterBearer = twitterClient.readOnly;

/**
 * Get user's recent tweets
 * @param {string} username - Twitter username (without @)
 * @param {number} count - Number of tweets to fetch (max 100)
 * @returns {Promise<Object>} Twitter API response
 */
export const getUserTweets = async (username, count = 10) => {
  try {
    // First get user by username
    const user = await twitterBearer.v2.userByUsername(username);

    if (!user.data) {
      throw new Error(`User ${username} not found`);
    }

    // Get user's tweets
    const tweets = await twitterBearer.v2.userTimeline(user.data.id, {
      max_results: Math.min(count, 100),
      "tweet.fields": [
        "created_at",
        "text",
        "public_metrics",
        "context_annotations",
        "entities",
        "attachments",
        "author_id",
        "conversation_id",
        "in_reply_to_user_id",
        "referenced_tweets",
        "reply_settings",
        "source",
        "withheld",
      ],
      "user.fields": [
        "id",
        "name",
        "username",
        "profile_image_url",
        "verified",
        "description",
        "public_metrics",
        "created_at",
      ],
      "media.fields": [
        "type",
        "url",
        "preview_image_url",
        "alt_text",
        "width",
        "height",
        "public_metrics",
      ],
      expansions: [
        "author_id",
        "attachments.media_keys",
        "referenced_tweets.id",
        "referenced_tweets.id.author_id",
      ],
      exclude: ["retweets", "replies"], // Only original tweets
    });

    return {
      data: tweets.data.data || [],
      includes: tweets.data.includes || {},
      meta: tweets.data.meta || {},
      user: user.data,
    };
  } catch (error) {
    console.error("Error fetching user tweets:", error);
    throw error;
  }
};

/**
 * Get a specific tweet by ID
 * @param {string} tweetId - Tweet ID
 * @returns {Promise<Object>} Twitter API response
 */
export const getTweetById = async (tweetId) => {
  try {
    const tweet = await twitterBearer.v2.singleTweet(tweetId, {
      "tweet.fields": [
        "created_at",
        "text",
        "public_metrics",
        "context_annotations",
        "entities",
        "attachments",
        "author_id",
        "conversation_id",
        "in_reply_to_user_id",
        "referenced_tweets",
        "reply_settings",
        "source",
      ],
      "user.fields": [
        "id",
        "name",
        "username",
        "profile_image_url",
        "verified",
        "description",
        "public_metrics",
      ],
      "media.fields": [
        "type",
        "url",
        "preview_image_url",
        "alt_text",
        "width",
        "height",
      ],
      expansions: [
        "author_id",
        "attachments.media_keys",
        "referenced_tweets.id",
        "referenced_tweets.id.author_id",
      ],
    });

    return {
      data: tweet.data,
      includes: tweet.includes || {},
    };
  } catch (error) {
    console.error("Error fetching tweet:", error);
    throw error;
  }
};

/**
 * Search for tweets
 * @param {string} query - Search query
 * @param {number} count - Number of tweets to fetch
 * @returns {Promise<Object>} Twitter API response
 */
export const searchTweets = async (query, count = 10) => {
  try {
    const tweets = await twitterBearer.v2.search(query, {
      max_results: Math.min(count, 100),
      "tweet.fields": [
        "created_at",
        "text",
        "public_metrics",
        "context_annotations",
        "entities",
        "attachments",
        "author_id",
      ],
      "user.fields": [
        "id",
        "name",
        "username",
        "profile_image_url",
        "verified",
        "description",
      ],
      "media.fields": ["type", "url", "preview_image_url", "alt_text"],
      expansions: ["author_id", "attachments.media_keys"],
    });

    return {
      data: tweets.data.data || [],
      includes: tweets.data.includes || {},
      meta: tweets.data.meta || {},
    };
  } catch (error) {
    console.error("Error searching tweets:", error);
    throw error;
  }
};

/**
 * Get trending topics
 * @param {number} woeid - Where On Earth ID (1 for worldwide, 23424977 for United States)
 * @returns {Promise<Object>} Twitter API response
 */
export const getTrendingTopics = async (woeid = 1) => {
  try {
    // Note: Twitter API v2 doesn't have direct trending endpoint
    // This would require using v1.1 API or implementing alternative solution
    console.warn(
      "Trending topics require Twitter API v1.1 - not implemented in v2"
    );
    return { data: [], message: "Trending topics not available in API v2" };
  } catch (error) {
    console.error("Error fetching trending topics:", error);
    throw error;
  }
};

/**
 * Format tweet data for display
 * @param {Object} tweet - Raw tweet data
 * @param {Object} includes - Includes from API response
 * @returns {Object} Formatted tweet data
 */
export const formatTweetData = (tweet, includes = {}) => {
  // Find author from includes
  const author = includes.users?.find((user) => user.id === tweet.author_id);

  // Find media from includes
  const media =
    tweet.attachments?.media_keys
      ?.map((key) => includes.media?.find((m) => m.media_key === key))
      .filter(Boolean) || [];

  return {
    id: tweet.id,
    text: tweet.text,
    createdAt: tweet.created_at,
    author: author
      ? {
          id: author.id,
          name: author.name,
          username: author.username,
          profileImageUrl: author.profile_image_url,
          verified: author.verified || false,
          description: author.description,
        }
      : null,
    metrics: tweet.public_metrics || {},
    media: media.map((m) => ({
      type: m.type,
      url: m.url,
      previewImageUrl: m.preview_image_url,
      altText: m.alt_text,
      width: m.width,
      height: m.height,
    })),
    entities: tweet.entities || {},
    conversationId: tweet.conversation_id,
    referencedTweets: tweet.referenced_tweets || [],
    url: `https://twitter.com/${author?.username}/status/${tweet.id}`,
  };
};

// All functions are already exported individually above with 'export const'
// No additional exports needed here
