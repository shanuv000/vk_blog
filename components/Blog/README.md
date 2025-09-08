# Blog Components

This directory contains specialized components for blog functionality, including social media integration and tweet embedding.

## Components

### TwitterEmbed.jsx
Direct tweet embedding component with loading states, error handling, and responsive design.

**Features:**
- Multiple embedding methods for reliability
- Loading indicators and error states
- Fully responsive design (mobile-first approach)
- Tweet ID validation
- Fallback to direct Twitter links
- Touch-friendly interface for mobile devices
- Automatic responsive CSS injection

**Usage:**
```jsx
import TwitterEmbed from './components/Blog/TwitterEmbed';

<TwitterEmbed tweetId="1790555395041472948" />
```

### TweetEmbedder.jsx
Automatically scans DOM for tweet IDs and social embeds, converting them to Twitter embeds.

**Features:**
- Automatic blockquote scanning for tweet IDs
- Hygraph social embed processing
- Twitter widgets script loading
- DOM manipulation for embed replacement

**Usage:**
```jsx
import TweetEmbedder from './components/Blog/TweetEmbedder';

<div className="blog-content">
  <TweetEmbedder />
  {/* Your blog content */}
</div>
```

### SocialSharing.jsx
Social media sharing buttons with analytics tracking and animation effects.

**Supported Platforms:**
- Facebook
- Twitter/X
- LinkedIn
- WhatsApp
- Pinterest (when image available)
- Reddit
- Telegram
- Native device sharing

**Features:**
- Animated buttons with Framer Motion
- Proper URL encoding
- Image sharing support
- Fully responsive design with mobile-first approach
- Touch-friendly buttons (44px minimum touch targets)
- Analytics tracking ready
- Native device sharing support (when available)

**Usage:**
```jsx
import { SocialSharing } from './components/Blog/SocialSharing';

<SocialSharing post={postData} />
```

## Dependencies

- **React Icons**: `react-icons/fa6` for social media icons
- **Framer Motion**: Animation effects for sharing buttons
- **Twitter Widgets**: External script for tweet rendering
- **react-twitter-embed**: Primary Twitter embedding library

## Integration

These components are designed to work together as part of a comprehensive social media integration system. See the main `SOCIAL_MEDIA_BLOG_INSTRUCTIONS.md` for complete integration guidelines.

## Configuration

### Tweet Embedding Options
```javascript
const tweetOptions = {
  theme: "light",
  dnt: true,              // Do Not Track
  align: "center",
  conversation: "none",   // Hide conversation
  cards: "visible",       // Show cards
  width: "100%"
}
```

### Social Sharing Configuration
Update the base URL in `SocialSharing.jsx`:
```javascript
const rootUrl = "https://urtechy.com"; // Update as needed
```

## Responsive Design

All components are fully responsive and optimized for all device sizes:

### Breakpoints
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1023px (sm to lg)
- **Desktop**: ≥ 1024px (lg+)

### Mobile Optimizations
- Touch-friendly buttons (minimum 44px touch targets)
- Compact spacing and smaller text on mobile
- Responsive Twitter embed containers
- Automatic CSS injection for Twitter widget responsiveness
- Native device sharing support

### Tablet & Desktop
- Larger buttons and comfortable spacing
- Optimal layout for larger screens
- Enhanced hover effects

## Styling

All components use Tailwind CSS with:
- Mobile-first responsive design
- Loading states with skeleton animations
- Error states with graceful fallbacks
- Hover effects and transitions
- Consistent spacing and typography
- Touch-friendly interface elements
