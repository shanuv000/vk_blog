# Hygraph Configuration Guide for NextJS Integration

This guide provides detailed instructions for configuring Hygraph CMS with NextJS, focusing on rich text content rendering and optimal performance.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [API Configuration](#api-configuration)
3. [GraphQL Client Setup](#graphql-client-setup)
4. [Rich Text Configuration](#rich-text-configuration)
5. [NextJS Integration](#nextjs-integration)
6. [Performance Optimization](#performance-optimization)
7. [Error Handling](#error-handling)
8. [Advanced Features](#advanced-features)

## Environment Setup

Create a `.env.local` file in your NextJS project root with the following variables:

```bash
# Hygraph API Configuration
NEXT_PUBLIC_HYGRAPH_CONTENT_API=https://api-ap-south-1.hygraph.com/v2/YOUR_PROJECT_ID/master
NEXT_PUBLIC_HYGRAPH_CDN_API=https://ap-south-1.cdn.hygraph.com/content/YOUR_PROJECT_ID/master
HYGRAPH_AUTH_TOKEN=your-auth-token-here
```

> **Note**: Only use the `NEXT_PUBLIC_` prefix for variables that need to be accessible in the browser. Keep the auth token private by omitting this prefix.

## API Configuration

### Content API vs CDN API

Hygraph provides two API endpoints:

1. **Content API**: Used for read/write operations and always has the latest content
2. **CDN API**: Optimized for read-only operations with better performance due to caching

For optimal performance:

- Use the CDN API for public-facing content
- Use the Content API for admin operations or when you need real-time content

## GraphQL Client Setup

### Using Apollo Client (Recommended)

```javascript
// lib/apollo-client.js
import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Primary CDN link for better performance
const cdnLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_HYGRAPH_CDN_API,
});

// Fallback content API link
const contentLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_HYGRAPH_CONTENT_API,
});

// Create Apollo Client instance with caching configuration
const apolloClient = new ApolloClient({
  link: from([errorLink, cdnLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Configure caching for posts queries
          posts: {
            merge(existing = [], incoming) {
              return [...incoming];
            },
            read(existing, { args }) {
              if (!existing) return undefined;

              // If no args, return all cached posts
              if (!args) return existing;

              // Handle pagination
              const { first, skip } = args || {};

              // Apply pagination if specified
              if (first !== undefined && skip !== undefined) {
                return existing.slice(skip, skip + first);
              }

              return existing;
            }
          }
        }
      }
    }
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    },
  },
});

export default apolloClient;
```

### Using GraphQL Request (Lightweight Alternative)

```javascript
// lib/hygraph.js
import { GraphQLClient } from 'graphql-request';

// API endpoints
export const HYGRAPH_CONTENT_API = process.env.NEXT_PUBLIC_HYGRAPH_CONTENT_API;
export const HYGRAPH_CDN_API = process.env.NEXT_PUBLIC_HYGRAPH_CDN_API;
export const HYGRAPH_AUTH_TOKEN = process.env.HYGRAPH_AUTH_TOKEN;

// Create clients for different purposes
export const contentClient = new GraphQLClient(HYGRAPH_CONTENT_API);
export const cdnClient = new GraphQLClient(HYGRAPH_CDN_API);

// Create an authenticated client if token is available
export const authClient = HYGRAPH_AUTH_TOKEN
  ? new GraphQLClient(HYGRAPH_CONTENT_API, {
      headers: {
        authorization: `Bearer ${HYGRAPH_AUTH_TOKEN}`,
      },
    })
  : contentClient;

// Helper function with fallback mechanism
export const fetchFromCDN = async (query, variables = {}) => {
  try {
    return await cdnClient.request(query, variables);
  } catch (error) {
    console.log("Falling back to Content API due to CDN failure");
    return await contentClient.request(query, variables);
  }
};
```

## Rich Text Configuration

### Installing Required Packages

```bash
npm install @graphcms/rich-text-react-renderer @graphcms/rich-text-types
```

### Creating a Rich Text Renderer Component

```jsx
// components/RichTextRenderer.jsx
import { RichText } from '@graphcms/rich-text-react-renderer';
import Image from 'next/image';
import Link from 'next/link';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const RichTextRenderer = ({ content, references = [] }) => {
  // Handle case where content might be a string (JSON stringified)
  if (typeof content === 'string') {
    try {
      content = JSON.parse(content);
    } catch (error) {
      console.error('Failed to parse content string:', error);
      return <p>Error rendering content</p>;
    }
  }

  if (!content) {
    return <p className="text-gray-700 p-4 text-center">No content available.</p>;
  }

  // Create a map of references for easy lookup
  const referenceMap = {};
  if (references && references.length > 0) {
    references.forEach((reference) => {
      if (reference.id) {
        referenceMap[reference.id] = reference;
      }
    });
  }

  return (
    <div className="rich-text-content max-w-3xl mx-auto">
      <RichText
        content={content}
        references={referenceMap}
        renderers={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mt-12 mb-6 text-gray-900">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold mt-10 mb-5 text-gray-900">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-gray-700 mb-6 mt-4 leading-relaxed">{children}</p>
          ),
          a: ({ children, href, openInNewTab }) => (
            <Link
              href={href}
              target={openInNewTab ? '_blank' : '_self'}
              className="text-red-500 hover:text-red-700 underline transition-colors"
              rel={openInNewTab ? 'noopener noreferrer' : ''}
            >
              {children}
            </Link>
          ),
          img: ({ src, altText, height, width }) => (
            <div className="my-8">
              <Image
                src={src}
                alt={altText || 'Blog image'}
                height={height || 600}
                width={width || 1200}
                className="rounded-lg shadow-md"
              />
            </div>
          ),
          code_block: ({ children }) => {
            // Extract language and code
            const language = children.props?.className?.replace('language-', '') || 'javascript';
            const code = children.props?.children || '';

            return (
              <div className="my-6 rounded-md overflow-hidden">
                <SyntaxHighlighter
                  language={language}
                  style={atomDark}
                  showLineNumbers
                  wrapLines
                  className="text-sm"
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            );
          },
          // Add custom renderers for other elements as needed
        }}
      />
    </div>
  );
};

export default RichTextRenderer;
```

## NextJS Integration

### Data Fetching with getStaticProps

```jsx
// pages/blog/[slug].js
import { gql } from 'graphql-request';
import { cdnClient } from '../../lib/hygraph';
import RichTextRenderer from '../../components/RichTextRenderer';

// Query to get post details by slug
const GET_POST_DETAILS = gql`
  query GetPostDetails($slug: String!) {
    post(where: { slug: $slug }) {
      title
      excerpt
      featuredImage {
        url
        width
        height
      }
      author {
        name
        bio
        photo {
          url
        }
      }
      createdAt
      publishedAt
      slug
      content {
        json
        references {
          ... on Asset {
            id
            url
            mimeType
            width
            height
          }
        }
      }
      categories {
        name
        slug
      }
    }
  }
`;

// Query to get all post slugs for static paths
const GET_POST_SLUGS = gql`
  query GetPostSlugs {
    posts {
      slug
    }
  }
`;

export async function getStaticPaths() {
  const { posts } = await cdnClient.request(GET_POST_SLUGS);

  return {
    paths: posts.map((post) => ({ params: { slug: post.slug } })),
    fallback: 'blocking', // Show a loading state while generating the page
  };
}

export async function getStaticProps({ params }) {
  try {
    const { post } = await cdnClient.request(GET_POST_DETAILS, {
      slug: params.slug,
    });

    if (!post) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        post,
      },
      revalidate: 60, // Regenerate the page every 60 seconds if requested
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return {
      notFound: true,
    };
  }
}

const BlogPost = ({ post }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <div className="mb-8">
        <RichTextRenderer
          content={post.content.json}
          references={post.content.references || []}
        />
      </div>
    </div>
  );
};

export default BlogPost;
```

## Performance Optimization

### Incremental Static Regeneration (ISR)

NextJS supports Incremental Static Regeneration, which allows you to update static pages after they've been built without rebuilding the entire site:

```javascript
export async function getStaticProps({ params }) {
  // ... fetch data

  return {
    props: {
      post,
    },
    revalidate: 60, // Regenerate the page every 60 seconds if requested
  };
}
```

### Image Optimization

Use Next.js Image component with Hygraph images:

```jsx
import Image from 'next/image';

// In your component
<Image
  src={post.featuredImage.url}
  alt={post.title}
  width={post.featuredImage.width || 1200}
  height={post.featuredImage.height || 630}
  priority={true} // Load this image immediately
  quality={85} // Adjust quality as needed
  className="rounded-lg shadow-md"
/>
```

## Error Handling

Implement robust error handling for your Hygraph integration:

```javascript
// Fetch wrapper with error handling
export async function fetchHygraphData(query, variables = {}) {
  try {
    return await cdnClient.request(query, variables);
  } catch (error) {
    // Log the error for debugging
    console.error('Hygraph API error:', error);

    // Check for specific error types
    if (error.response?.status === 429) {
      console.log('Rate limit exceeded, retrying with backoff...');
      // Implement exponential backoff retry logic here
    }

    // Fallback to content API if CDN fails
    try {
      console.log('Falling back to Content API');
      return await contentClient.request(query, variables);
    } catch (fallbackError) {
      console.error('Content API fallback also failed:', fallbackError);
      throw new Error('Failed to fetch data from Hygraph');
    }
  }
}
```

## Advanced Features

### Twitter Embeds in Rich Text

Hygraph rich text content can include Twitter embeds in multiple ways. Here's a comprehensive guide on how to handle tweets in your rich text renderer:

#### 1. Using Numeric Tweet IDs in Blockquotes

The simplest way to embed tweets is by using numeric tweet IDs in blockquotes:

```jsx
// Add to your blockquote renderer
blockquote: ({ children }) => {
  // Check if children contains a numeric tweet ID
  const childText = children?.toString() || "";
  const isNumericTweetId = /^\d+$/.test(childText.trim());

  if (isNumericTweetId) {
    return (
      <div className="my-16 mx-auto max-w-4xl">
        <TwitterEmbed tweetId={childText.trim()} />
      </div>
    );
  }

  // Regular blockquote rendering for non-tweet content
  return (
    <blockquote className="border-l-4 border-red-400 bg-gray-50 pl-8 py-6 my-16 italic text-gray-700 max-w-3xl mx-auto rounded-r-lg shadow-sm">
      {children}
    </blockquote>
  );
}
```

With this approach, content editors can simply add a blockquote with only a numeric tweet ID:

```markdown
> 1790555395041472948
```

This will be automatically rendered as a Twitter embed.

#### 2. Using Social Embeds

For more structured embedding, use Hygraph's social embeds:

```jsx
// Add to your renderers object
embed: {
  SocialEmbed: ({ nodeId, children }) => {
    // Check if children contains a numeric tweet ID
    const childText = children?.toString() || "";
    const isNumericTweetId = /^\d+$/.test(childText.trim());

    if (isNumericTweetId) {
      return (
        <div className="my-16 mx-auto max-w-4xl">
          <TwitterEmbed tweetId={childText.trim()} />
        </div>
      );
    }

    // Handle specific social embeds based on nodeId
    // This is useful for mapping known embeds to specific tweet IDs
    const knownTweetIds = {
      'cmaa978sx201j08pkf4vzcw5u': '1780968555837366289',
      'cmaaa22po20ch08pkims5csgc': '1780968558731964825',
    };

    if (knownTweetIds[nodeId]) {
      return (
        <div className="my-16 mx-auto max-w-4xl">
          <TwitterEmbed tweetId={knownTweetIds[nodeId]} />
        </div>
      );
    }

    // Default fallback for unknown social embeds
    return (
      <div className="my-8 p-4 border border-gray-300 rounded-lg bg-gray-50 text-center">
        <p className="text-gray-500">Social embed content (ID: {nodeId})</p>
      </div>
    );
  }
}
```

#### 3. Using a DOM Scanner Approach

For more complex scenarios, you can use a DOM scanner approach with a dedicated component:

```jsx
// components/TweetEmbedder.jsx
import React, { useEffect } from "react";

const TweetEmbedder = () => {
  useEffect(() => {
    // Load Twitter widget script
    const loadTwitterScript = () => {
      if (window.twttr) return Promise.resolve();

      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.setAttribute("src", "https://platform.twitter.com/widgets.js");
        script.onload = resolve;
        document.head.appendChild(script);
      });
    };

    // Create tweet embed
    const createTweet = (tweetId, container) => {
      window.twttr.widgets
        .createTweet(tweetId, container, {
          theme: "light",
          align: "center",
        })
        .catch((error) => {
          console.error("Error embedding tweet:", error);
          container.innerHTML = `
            <div class="p-4 border border-red-100 rounded-lg bg-red-50 text-center">
              <p class="text-red-500">Could not load tweet. It may have been deleted or is private.</p>
            </div>
          `;
        });
    };

    // Process blockquotes with numeric content
    const processBlockquotes = async () => {
      document.querySelectorAll(".blog-content blockquote").forEach((blockquote) => {
        const text = blockquote.textContent.trim();
        if (/^\d+$/.test(text)) {
          const tweetContainer = document.createElement("div");
          tweetContainer.className = "my-16 mx-auto max-w-4xl tweet-container";
          blockquote.parentNode.replaceChild(tweetContainer, blockquote);
          createTweet(text, tweetContainer);
        }
      });
    };

    // Main function
    const processPage = async () => {
      await loadTwitterScript();
      await processBlockquotes();
    };

    // Run with a slight delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(processPage, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  return <div className="tweet-embedder-container hidden" />;
};

export default TweetEmbedder;
```

Then include this component in your blog layout:

```jsx
// In your blog post component
<div className="blog-content">
  <TweetEmbedder />
  <RichTextRenderer content={post.content.json} references={post.content.references} />
</div>
```

#### 4. Creating a TwitterEmbed Component

For all the above approaches, you'll need a TwitterEmbed component:

```jsx
// components/TwitterEmbed.jsx
import React, { useEffect, useRef } from "react";

const TwitterEmbed = ({ tweetId }) => {
  const tweetRef = useRef(null);

  useEffect(() => {
    const currentTweetRef = tweetRef.current;

    // Skip if no tweet ID
    if (!tweetId) return;

    // Load Twitter widget script if needed
    if (!window.twttr) {
      const script = document.createElement("script");
      script.setAttribute("src", "https://platform.twitter.com/widgets.js");
      script.setAttribute("async", true);
      document.head.appendChild(script);
      script.onload = renderTweet;
    } else {
      renderTweet();
    }

    function renderTweet() {
      if (window.twttr && currentTweetRef) {
        window.twttr.widgets.createTweet(tweetId, currentTweetRef, {
          theme: "light",
          dnt: true,
          align: "center",
        });
      }
    }

    return () => {
      if (currentTweetRef) {
        currentTweetRef.innerHTML = "";
      }
    };
  }, [tweetId]);

  return (
    <div className="my-6">
      <div
        ref={tweetRef}
        className="twitter-tweet-container flex justify-center items-center min-h-[200px]"
      >
        <div className="animate-pulse flex flex-col items-center justify-center p-4 w-full">
          <div className="h-10 bg-gray-200 rounded-full w-10 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="mt-4 text-blue-400 text-sm">Loading tweet...</div>
        </div>
      </div>
    </div>
  );
};

export default TwitterEmbed;
```

#### 5. GraphQL Query Structure

When querying Hygraph for rich text content that may contain tweets, ensure you include the necessary fields:

```graphql
query GetPostWithTweets($slug: String!) {
  post(where: { slug: $slug }) {
    content {
      json
      references {
        ... on Asset {
          id
          url
          mimeType
        }
      }
    }
  }
}
```

### Custom Embeds

Configure custom embeds like Twitter or YouTube in your Rich Text renderer:

```jsx
// Add to your renderers object in RichTextRenderer.jsx
embeds: {
  Twitter: ({ nodeId, url }) => {
    // Extract tweet ID from URL
    const tweetId = url.split('/').pop();
    return <TwitterEmbed tweetId={tweetId} />;
  },
  YouTube: ({ nodeId, url }) => {
    // Extract video ID from URL
    const videoId = new URL(url).searchParams.get('v');
    return (
      <div className="aspect-w-16 aspect-h-9 my-8">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-lg shadow-md"
        />
      </div>
    );
  },
}
```

### Webhook Integration

Set up webhooks to trigger revalidation when content changes:

```javascript
// pages/api/revalidate.js
export default async function handler(req, res) {
  // Check for secret to confirm this is a valid request
  if (req.query.secret !== process.env.REVALIDATION_SECRET) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  try {
    // Extract slug from the webhook payload
    const { data } = req.body;
    const slug = data?.slug;

    if (!slug) {
      return res.status(400).json({ message: 'Slug is required' });
    }

    // Revalidate the specific page
    await res.revalidate(`/blog/${slug}`);

    // Also revalidate the blog index page
    await res.revalidate('/blog');

    return res.json({ revalidated: true });
  } catch (err) {
    // If there was an error, Next.js will continue to show the last successfully generated page
    return res.status(500).send('Error revalidating');
  }
}
```

Configure this webhook in your Hygraph project settings to trigger when content is published or updated.
