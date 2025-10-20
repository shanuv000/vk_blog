# Tweet Embed Quick Reference 🚀

## Usage

### Basic Usage
```jsx
import EnhancedTweetEmbed from './components/EnhancedTweetEmbed';

<EnhancedTweetEmbed tweetId="1234567890" />
```

### With All Options
```jsx
<EnhancedTweetEmbed 
  tweetId="1234567890"
  variant="inline"        // 'card' | 'inline' | 'compact'
  className="my-custom-class"
  showError={true}        // Show error states
  showSkeleton={true}     // Show loading skeleton
  onLoad={() => {}}       // Callback on success
  onError={(err) => {}}   // Callback on error
/>
```

## Variants

### Card (Default)
```jsx
<EnhancedTweetEmbed tweetId="123" variant="card" />
```
- Full-featured display
- Shows all metadata
- Best for post detail pages

### Inline
```jsx
<EnhancedTweetEmbed tweetId="123" variant="inline" />
```
- Compact display
- Fits within content flow
- Best for article content

### Compact
```jsx
<EnhancedTweetEmbed tweetId="123" variant="compact" />
```
- Minimal metadata
- Space-efficient
- Best for sidebars

## Configuration

Edit `lib/tweet-embed-config.js`:

```javascript
export const TWEET_EMBED_CONFIG = {
  performance: {
    lazyLoad: true,              // Enable lazy loading
    lazyLoadMargin: "200px",     // Load distance
    cacheDuration: 300000,       // 5 minutes
  },
  api: {
    endpoint: "/api/twitter/tweet",
    timeout: 8000,
    maxRetries: 2,
  },
  rendering: {
    showLoadingSkeleton: true,
    showErrorState: true,
  },
};
```

## Utilities

### Validate Tweet ID
```javascript
import { isValidTweetId } from '../lib/tweet-embed-config';

if (isValidTweetId("1234567890")) {
  // Valid
}
```

### Extract Tweet ID from URL
```javascript
import { extractTweetId } from '../lib/tweet-embed-config';

const id = extractTweetId("https://twitter.com/user/status/1234567890");
// Returns: "1234567890"
```

### Get Configuration
```javascript
import { getTweetEmbedConfig } from '../lib/tweet-embed-config';

const config = getTweetEmbedConfig('inline');
```

## In PostDetail.jsx

```jsx
<section className="mt-12">
  <ErrorBoundary fallback={<ErrorFallback />}>
    <SocialMediaEmbedder key={post.slug} />
  </ErrorBoundary>
</section>
```

## In RichTextRenderer

```jsx
<EnhancedTweetEmbed
  tweetId={tweetId}
  variant="inline"
  showError={true}
  showSkeleton={true}
/>
```

## Error Handling

### Custom Error Handler
```jsx
<EnhancedTweetEmbed
  tweetId="123"
  onError={(error) => {
    console.error('Tweet failed:', error);
    // Custom handling
  }}
/>
```

### Error Boundary
```jsx
<ErrorBoundary fallback={<CustomError />}>
  <EnhancedTweetEmbed tweetId="123" />
</ErrorBoundary>
```

## Performance Tips

1. **Use lazy loading** - Enabled by default
2. **Enable caching** - Configured in config file
3. **Deduplicate requests** - Automatic
4. **Use variants wisely** - Choose appropriate variant

## Troubleshooting

### Tweet not loading?
- Check tweet ID format (10+ digits)
- Verify API endpoint is accessible
- Check browser console for errors

### Slow performance?
- Ensure lazy loading is enabled
- Check cache configuration
- Verify bundle size is optimized

### Rate limit errors?
- Increase cache duration
- Enable request deduplication
- Implement exponential backoff

## Browser Support

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile browsers

## Related Files

- `lib/tweet-embed-config.js` - Configuration
- `components/EnhancedTweetEmbed/index.jsx` - Main component
- `components/PostDetail.jsx` - Usage example
- `components/RichTextRenderer.jsx` - Content integration

## Full Documentation

See [TWEET_EMBED_OPTIMIZATION.md](./TWEET_EMBED_OPTIMIZATION.md) for complete details.
