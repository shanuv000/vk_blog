# Tweet Embed Position Fix - Quick Reference

## Problem
Tweets appearing at bottom of page instead of in correct position.

## Root Cause
**Primary Issue**: Blockquotes marked as "processed" before pattern matching, preventing subsequent passes from converting them.

**Secondary Issue**: Stale processing flags persisting from previous route navigations, causing blockquotes to be skipped even on fresh page loads.

## Solution
1. Only mark blockquotes as processed **after** successful social media identification
2. Clean up stale processing flags before first pass runs

## Code Changes

### File: `components/SocialMediaEmbedder.jsx`

**Line ~898**: Removed premature processing flag
```javascript
// OLD: Set flags before pattern matching
blockquote.setAttribute("data-processed", "true");

// NEW: Wait until after pattern matching
// Don't mark as processed yet
```

**Line ~963**: Added conditional processing flag
```javascript
if (socialUrl && platform) {
  // Mark as processed only when successfully identified
  blockquote.setAttribute("data-processed", "true");
  blockquote.setAttribute("data-mobile-processed", "true");
  
  extractedEmbeds.push({...});
}
```

**Line ~995**: Stale flag cleanup (before first pass)
```javascript
const cleanupStaleFlags = () => {
  document.querySelectorAll("blockquote[data-processed='true'], ...").forEach((blockquote) => {
    // Check if there's actually an embed container
    const hasEmbedContainer = document.querySelector(`[data-replaces-blockquote="${blockquoteId}"]`);
    
    // If no embed exists but marked as processed, clear stale flags
    if (!hasEmbedContainer && blockquote.style.display !== "none") {
      console.log(`🧹 Cleaning stale processing flags...`);
      blockquote.removeAttribute("data-processed");
      // ... remove other flags
    }
  });
};
cleanupStaleFlags(); // Run before first pass
```

**Line ~920**: Added debug logging
```javascript
if (/^\d+$/.test(text) && text.length > 8) {
  socialUrl = text;
  platform = "twitter";
  console.log(`✓ Matched Twitter ID: ${text}`);
}
```

## Testing

1. Navigate to post with multiple tweets
2. Check console for: `🧹 Cleaning stale processing flags...` (if needed)
3. Check console for: `✓ Matched Twitter ID: [id]`
4. Verify all tweets appear in-content (not at bottom)
5. Test route changes - verify no stale flags persist

## Console Output (Expected)

### Success
```
🧹 Cleaning stale processing flags from blockquote: 1503619645118779395
✓ Matched Twitter ID: 1503619645118779395
✓ Matched Twitter ID: 1504333874620297223
First pass found 9 social media embeds
```

### Debug (if issues)
```
✗ Blockquote 6 not matched: {
  text: "...",
  isNumeric: false,
  length: 10,
  hasLinks: 0
}
```

## Impact
✅ All tweet IDs converted across all passes  
✅ Stale flags cleaned on route changes  
✅ Proper content positioning  
✅ Better debugging visibility  
✅ No breaking changes

## Related Docs
- `TWEET_EMBED_POSITION_FIX.md` - Detailed explanation
- `TWEET_EMBED_THEME_CUSTOMIZATION.md` - Theme colors
- `TWEET_EMBED_COMPLETE.md` - Full implementation guide
