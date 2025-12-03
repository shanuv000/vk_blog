const { extractTweetId } = require('./lib/tweet-embed-config');

const testCases = [
  '1234567890123456789',
  'https://twitter.com/user/status/1234567890123456789',
  'https://x.com/user/status/1234567890123456789',
  'https://twitter.com/i/status/1234567890123456789',
  'Just some text',
  'https://facebook.com/post/123',
];

testCases.forEach(input => {
  const id = extractTweetId(input);
  console.log(`Input: "${input}" -> ID: ${id}`);
});
