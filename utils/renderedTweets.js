// Simple module-level registry to avoid rendering the same Tweet ID multiple times per page
// Note: This resets on navigation/refresh and is intended for client-side dedupe only.

const rendered = new Set();

export function hasRendered(tweetId) {
  if (!tweetId) return false;
  return rendered.has(String(tweetId));
}

export function markRendered(tweetId) {
  if (!tweetId) return;
  rendered.add(String(tweetId));
}

export function resetRendered() {
  rendered.clear();
}

export default { hasRendered, markRendered, resetRendered };
