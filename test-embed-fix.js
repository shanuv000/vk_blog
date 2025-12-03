
// Simulation of the fixed logic in RichTextRenderer.jsx
function testRichTextRendererLogic(trimmedText) {
  let tweetId = null;
  let isExactlyTweetId = false;

  // Original logic simulation
  if (/^\d+$/.test(trimmedText) && trimmedText.length > 8) {
      tweetId = trimmedText;
      isExactlyTweetId = true;
  }

  // New logic
  if (!isExactlyTweetId && !tweetId && typeof trimmedText === "string") {
    const patterns = [
      /twitter\.com\/\w+\/status\/(\d+)/,
      /x\.com\/\w+\/status\/(\d+)/,
      /\/status\/(\d+)/
    ];
    
    for (const pattern of patterns) {
      const match = trimmedText.match(pattern);
      if (match && match[1]) {
        tweetId = match[1];
        isExactlyTweetId = true;
        break;
      }
    }
  }

  return { tweetId, isExactlyTweetId };
}

// Simulation of the fixed logic in SocialMediaEmbedder.jsx (InPlaceEmbed)
function testSocialMediaEmbedderLogic(text) {
  let isTwitter = false;
  
  // Original logic
  if (/^\d+$/.test(text) && text.length > 8) {
    isTwitter = true;
  } 
  // New logic
  else if (text.includes("twitter.com") || text.includes("x.com")) {
      const match = text.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
      if (match && match[1]) {
        isTwitter = true;
      }
  }

  return isTwitter;
}

// Simulation of the fixed logic in SocialMediaEmbedder.jsx (TwitterEmbed extraction)
function testTwitterEmbedExtraction(url) {
    let tweetId = url;
    // Try to extract ID if it looks like a URL
    if (url && (url.includes('twitter.com') || url.includes('x.com'))) {
    const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
    if (match && match[1]) {
        tweetId = match[1];
    }
    }
    return tweetId;
}

const testCases = [
  '1234567890123456789',
  'https://twitter.com/user/status/1234567890123456789',
  'https://x.com/user/status/1234567890123456789',
  'https://twitter.com/i/status/1234567890123456789',
  'Just some text',
];

console.log('--- RichTextRenderer Logic Test ---');
testCases.forEach(input => {
  const result = testRichTextRendererLogic(input);
  console.log(`Input: "${input}" -> ID: ${result.tweetId}, Detected: ${result.isExactlyTweetId}`);
});

console.log('\n--- SocialMediaEmbedder Logic Test (Detection) ---');
testCases.forEach(input => {
  const result = testSocialMediaEmbedderLogic(input);
  console.log(`Input: "${input}" -> Is Twitter: ${result}`);
});

console.log('\n--- SocialMediaEmbedder Logic Test (Extraction) ---');
testCases.forEach(input => {
    const result = testTwitterEmbedExtraction(input);
    console.log(`Input: "${input}" -> Extracted ID: ${result}`);
  });
