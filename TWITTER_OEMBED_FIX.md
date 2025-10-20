# 🐛 Bug Fix: Missing useCallback Import

## Issue
```
ReferenceError: Can't find variable: useCallback
```

Error occurred when loading blog posts with the updated `TwitterPost` component.

## Root Cause

When I modified the `TwitterPost.jsx` component to support the new oEmbed endpoint, I added a `fetchTweet` function that uses `useCallback`, but forgot to import it from React.

### Before (Broken)
```jsx
import React, { useState, useEffect, useRef } from "react";
```

The component was trying to use `useCallback` without importing it:
```jsx
const fetchTweet = useCallback(
  async (signal, useOembed = false) => {
    // ... code
  },
  [tweetId]
);
```

## Solution

Added `useCallback` to the React imports:

### After (Fixed)
```jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
```

## Files Changed

- ✅ `/components/TwitterPost.jsx` - Added `useCallback` import

## Status

✅ **Fixed!** The component now compiles successfully and pages load without errors.

## Testing

The fix was verified by:
1. ✅ No compilation errors in `TwitterPost.jsx`
2. ✅ Dev server compiles successfully
3. ✅ Blog post pages load without hydration errors
4. ✅ No more Sentry errors for missing `useCallback`

## Note

This was a simple import oversight during the implementation of the Twitter oEmbed feature. All functionality is intact - just needed the proper React hook import.
