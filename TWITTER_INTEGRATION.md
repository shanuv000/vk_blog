# Twitter Integration with Twitter API v2

This documentation covers the Twitter integration implementation using Twitter API v2 with the `twitter-api-v2` library.

## Overview

The Twitter integration provides:
- Display individual tweets with rich metadata
- Show user timelines/feeds  
- Search functionality
- Full responsive design
- Error handling and fallbacks
- Backward compatibility with existing TwitterEmbed

## Setup

### 1. Environment Variables

The following environment variables are configured in `.env.local`:

```bash
# Twitter API v2 Configuration
TWITTER_API_KEY=VIqQO4PilU8pOuCNzCnbUCK0t
TWITTER_API_SECRET=eg4wEWZZuc6BVngHFxQEyehIt00E1UdhyO7ULg8bnyD9t3BP5y
TWITTER_ACCESS_TOKEN=1792802562090913792-eDtaL7RbMSp4tbJutw9B01bLjz9X1I
TWITTER_ACCESS_TOKEN_SECRET=ksYHvUvzu3Skdqsc1C7NhbveZ8e4Bn7amHUdwkkDBLNpP
TWITTER_CLIENT_ID=WUJwUEtwWnlwVHNnb3ZPOVc3cjU6MTpjaQ
TWITTER_CLIENT_SECRET=9BoW4neM5MG76MbZNem4_WWE2FGaL3WLhMHoyIVLqraSf1GiAk
```

### 2. Dependencies

```bash
npm install twitter-api-v2 date-fns
```

## Components

### TwitterPost

Display a single tweet with full metadata and styling.

```jsx
import { TwitterPost } from '../components';

<TwitterPost tweetId="1790555395041472948" className="my-4" />
```

**Props:**
- `tweetId` (string): The Twitter tweet ID
- `className` (string): Additional CSS classes

**Features:**
- Author information with profile image and verification badge
- Tweet text with formatted links, mentions, and hashtags
- Media attachments (images/videos)
- Engagement metrics (likes, retweets, replies)
- Responsive design
- Error handling with fallback links

### TwitterUserFeed

Display a user's recent tweets in a timeline format.

```jsx
import { TwitterUserFeed } from '../components';

<TwitterUserFeed username="elonmusk" count={5} className="mb-8" />
```

**Props:**
- `username` (string): Twitter username (without @)
- `count` (number): Number of tweets to display (default: 5, max: 100)
- `className` (string): Additional CSS classes

**Features:**
- User profile header with bio and verification
- Timeline of recent tweets
- "View more" link to Twitter profile
- Loading states and error handling

### Updated TwitterEmbed

Enhanced version of existing TwitterEmbed with API v2 support.

```jsx
import { TwitterEmbed } from '../components';

// Use new API version (recommended)
<TwitterEmbed tweetId="1790555395041472948" useApiVersion={true} />

// Use legacy embed (fallback)
<TwitterEmbed tweetId="1790555395041472948" useApiVersion={false} />
```

**Props:**
- `tweetId` (string): The Twitter tweet ID  
- `useApiVersion` (boolean): Use new API version (default: true)

## API Endpoints

### GET /api/twitter/tweet/[tweetId]

Fetch a single tweet by ID.

```javascript
const response = await fetch('/api/twitter/tweet/1790555395041472948');
const data = await response.json();
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1790555395041472948",
    "text": "Tweet content...",
    "createdAt": "2024-05-15T01:23:45.000Z",
    "author": {
      "id": "12345",
      "name": "Author Name",
      "username": "username",
      "profileImageUrl": "https://...",
      "verified": true
    },
    "metrics": {
      "like_count": 1250,
      "retweet_count": 340,
      "reply_count": 89
    },
    "media": [...],
    "url": "https://twitter.com/username/status/1790555395041472948"
  }
}
```

### GET /api/twitter/user/[username]

Fetch recent tweets from a user.

**Parameters:**
- `count` (query): Number of tweets (default: 10, max: 100)

```javascript
const response = await fetch('/api/twitter/user/elonmusk?count=5');
const data = await response.json();
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tweets": [...],
    "user": {
      "id": "44196397",
      "name": "Elon Musk",
      "username": "elonmusk",
      "description": "...",
      "verified": true
    },
    "meta": {
      "result_count": 5
    }
  }
}
```

### GET /api/twitter/search

Search for tweets by query.

**Parameters:**
- `q` (query): Search query
- `count` (query): Number of results (default: 10, max: 100)

```javascript
const response = await fetch('/api/twitter/search?q=nextjs&count=10');
const data = await response.json();
```

## Hooks

### useTweet

```jsx
import { useTweet } from '../hooks/useTwitter';

const MyComponent = () => {
  const { tweet, loading, error } = useTweet('1790555395041472948');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{tweet?.text}</div>;
};
```

### useUserTweets

```jsx
import { useUserTweets } from '../hooks/useTwitter';

const UserFeed = ({ username }) => {
  const { tweets, user, loading, error, refetch } = useUserTweets(username, 10);
  
  // Component implementation
};
```

### useTwitterSearch

```jsx
import { useTwitterSearch } from '../hooks/useTwitter';

const SearchResults = () => {
  const { tweets, loading, error, search } = useTwitterSearch('nextjs', 20);
  
  // Component implementation
};
```

## Usage Examples

### In Blog Posts

```jsx
// In your blog post content or RichTextRenderer
import { TwitterPost } from '../components';

const BlogPost = ({ post }) => {
  return (
    <div>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
      
      {/* Embed a specific tweet */}
      <TwitterPost tweetId="1790555395041472948" />
    </div>
  );
};
```

### Author Social Media Section

```jsx
import { TwitterUserFeed } from '../components';

const AuthorSection = ({ author }) => {
  return (
    <div>
      <h2>Follow {author.name} on Twitter</h2>
      <TwitterUserFeed 
        username={author.twitterUsername} 
        count={3}
        className="mt-4"
      />
    </div>
  );
};
```

### Social Media Dashboard

```jsx
import { TwitterUserFeed, useTwitterSearch } from '../components';

const SocialDashboard = () => {
  const { tweets: blogMentions } = useTwitterSearch('yourblog.com', 5);
  
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h3>Latest Tweets</h3>
        <TwitterUserFeed username="yourusername" count={5} />
      </div>
      <div>
        <h3>Blog Mentions</h3>
        {blogMentions.map(tweet => (
          <TwitterPost key={tweet.id} tweetId={tweet.id} />
        ))}
      </div>
    </div>
  );
};
```

## Error Handling

The integration includes comprehensive error handling:

- **Rate Limiting**: Automatic handling of Twitter API rate limits
- **Network Errors**: Graceful fallbacks for connectivity issues  
- **Invalid IDs**: User-friendly error messages
- **Private/Deleted Tweets**: Fallback links to Twitter
- **API Unavailable**: Service status error handling

## Styling

All components use Tailwind CSS and are fully responsive:
- Mobile-first design
- Dark/light theme support ready
- Consistent with blog design system
- Hover states and transitions
- Accessibility features

## Rate Limits

Twitter API v2 rate limits (per 15-minute window):
- User timeline: 75 requests
- Single tweet: 75 requests  
- Search: 180 requests

The integration handles rate limiting automatically and provides appropriate error messages.

## Demo

Visit `/twitter-demo` to see all components in action with live examples.

## Migration from Legacy

To migrate existing TwitterEmbed usage:

```jsx
// Old way
<TwitterEmbed tweetId="123456789" />

// New way (recommended)
<TwitterPost tweetId="123456789" />

// Or use updated TwitterEmbed
<TwitterEmbed tweetId="123456789" useApiVersion={true} />
```

## Benefits over Legacy Implementation

1. **Better Performance**: No external widget scripts
2. **More Control**: Custom styling and behavior
3. **Rich Metadata**: Access to metrics, author info, media
4. **SEO Friendly**: Server-rendered content
5. **Responsive**: Fully responsive design
6. **Reliable**: Direct API access vs embed widgets
7. **Customizable**: Easy to modify appearance and behavior

## Troubleshooting

### Common Issues

1. **"User not found" error**: Check username spelling
2. **"Rate limit exceeded"**: Wait 15 minutes or implement caching
3. **"Tweet not found"**: Tweet may be deleted or private
4. **API connection issues**: Check environment variables

### Debug Mode

Set `NODE_ENV=development` to enable detailed error logging.

### Support

For issues or questions about the Twitter integration, check:
1. Twitter API v2 documentation
2. Component props and usage examples above
3. Browser console for detailed error messages