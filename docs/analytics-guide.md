# Analytics Implementation Guide

This document provides an overview of the Google Analytics implementation in the urTechy Blogs application.

## Overview

The application uses Google Analytics 4 (GA4) to track user interactions and page views. The implementation includes:

1. **Page View Tracking**: Automatically tracks page views when users navigate through the site
2. **Event Tracking**: Tracks user interactions like clicks, form submissions, etc.
3. **Custom Dimensions**: Captures additional metadata about content and user behavior
4. **Engagement Metrics**: Tracks scroll depth, time on page, and other engagement metrics

## Environment Variables

The following environment variables are used for analytics:

```
# Google Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS=G-VQRT44X8WH
NEXT_PUBLIC_ENABLE_ANALYTICS_IN_DEV=false
```

- `NEXT_PUBLIC_GOOGLE_ANALYTICS`: Your Google Analytics 4 Measurement ID
- `NEXT_PUBLIC_ENABLE_ANALYTICS_IN_DEV`: Set to `true` to enable analytics in development mode (default: `false`)

## Analytics Components and Hooks

### Components

1. **AnalyticsProvider**: Initializes Google Analytics and provides tracking context
   - Located at: `components/AnalyticsProvider.js`
   - Used in: `pages/_app.js`

2. **SocialShareButtons**: Social sharing buttons with built-in analytics tracking
   - Located at: `components/SocialShareButtons.js`
   - Tracks when users share content on social media

### Hooks

1. **useAnalytics**: General-purpose analytics hook
   - Located at: `hooks/useAnalytics.js`
   - Provides methods for tracking various events

2. **usePostAnalytics**: Post-specific analytics hook
   - Located at: `hooks/usePostAnalytics.js`
   - Tracks post views, shares, comments, etc.

### Utility Functions

The `lib/analytics.js` file contains utility functions for:

- Initializing Google Analytics
- Tracking page views
- Tracking events
- Tracking user timing
- Setting user properties
- Tracking exceptions
- Tracking scroll depth
- Tracking time on page
- Tracking outbound links
- Tracking file downloads

## How to Use

### Tracking Page Views

Page views are automatically tracked when users navigate through the site. No additional code is needed.

### Tracking Events

To track custom events, use the `useAnalytics` hook:

```jsx
import useAnalytics from '../hooks/useAnalytics';

function MyComponent() {
  const { trackEvent } = useAnalytics();
  
  const handleButtonClick = () => {
    trackEvent('button_click', {
      button_name: 'subscribe',
      button_location: 'header'
    });
    
    // Your button click logic
  };
  
  return (
    <button onClick={handleButtonClick}>
      Subscribe
    </button>
  );
}
```

### Tracking Post Interactions

To track post-specific interactions, use the `usePostAnalytics` hook:

```jsx
import usePostAnalytics from '../hooks/usePostAnalytics';

function PostComponent({ post }) {
  const { trackShare, trackComment } = usePostAnalytics(post);
  
  const handleShare = (platform) => {
    trackShare(platform);
    // Your share logic
  };
  
  const handleComment = () => {
    trackComment();
    // Your comment logic
  };
  
  return (
    <div>
      <h1>{post.title}</h1>
      <button onClick={() => handleShare('twitter')}>Share on Twitter</button>
      <button onClick={handleComment}>Add Comment</button>
    </div>
  );
}
```

### Using the Higher-Order Component

To add analytics tracking to any component, use the `withAnalytics` higher-order component:

```jsx
import withAnalytics from '../components/withAnalytics';

function MyComponent(props) {
  // Your component logic
  return (
    <div>
      <button onClick={props.onClick}>Click Me</button>
    </div>
  );
}

export default withAnalytics(MyComponent, {
  componentName: 'MyComponent',
  eventCategory: 'User Interface'
});
```

## Google Analytics Dashboard

To view analytics data, go to the Google Analytics dashboard:

1. Visit [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Select the urTechy Blogs property
4. Navigate to the "Reports" section

## Best Practices

1. **Be Descriptive**: Use clear, descriptive names for events and parameters
2. **Be Consistent**: Follow a consistent naming convention for events and parameters
3. **Respect Privacy**: Don't track personally identifiable information (PII)
4. **Test Tracking**: Verify that events are being tracked correctly using the Google Analytics Debugger
5. **Document Custom Events**: Keep documentation of custom events and their parameters up to date
