# Integrating Hygraph with React 19

This guide provides instructions on how to integrate Hygraph (formerly GraphCMS) data into a React 19 project. We'll focus on fetching and displaying specific data from your existing Hygraph content.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Installing Dependencies](#installing-dependencies)
4. [Creating the GraphQL Client](#creating-the-graphql-client)
5. [Fetching Data from Hygraph](#fetching-data-from-hygraph)
6. [Creating React Components](#creating-react-components)
7. [Example: Displaying Featured Posts](#example-displaying-featured-posts)
8. [Example: Displaying Post Details](#example-displaying-post-details)
9. [Handling Images](#handling-images)
10. [Error Handling](#error-handling)

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Basic knowledge of React and GraphQL
- A Hygraph account with existing content

## Environment Setup

Create a `.env` file in your project root with the following variables:

```
# Hygraph API Configuration
VITE_HYGRAPH_CONTENT_API=https://api-ap-south-1.hygraph.com/v2/cky5wgpym15ym01z44tk90zeb/master
VITE_HYGRAPH_CDN_API=https://ap-south-1.cdn.hygraph.com/content/cky5wgpym15ym01z44tk90zeb/master
VITE_HYGRAPH_AUTH_TOKEN=your-auth-token-here
```

> **Note**: For React 19 with Vite, we use the `VITE_` prefix for environment variables instead of `NEXT_PUBLIC_` which is used in Next.js.

## Installing Dependencies

Create a new React 19 project:

```bash
npm create vite@latest my-hygraph-app -- --template react
cd my-hygraph-app
```

Install the necessary dependencies:

```bash
npm install graphql-request graphql moment react-lazy-load-image-component
```

## Creating the GraphQL Client

Create a file `src/services/hygraph.js`:

```javascript
import { GraphQLClient, gql } from "graphql-request";

// API endpoints
export const HYGRAPH_CONTENT_API = import.meta.env.VITE_HYGRAPH_CONTENT_API;
export const HYGRAPH_CDN_API = import.meta.env.VITE_HYGRAPH_CDN_API;
export const HYGRAPH_AUTH_TOKEN = import.meta.env.VITE_HYGRAPH_AUTH_TOKEN;

// Create clients for different purposes
export const contentClient = new GraphQLClient(HYGRAPH_CONTENT_API);

// Create an authenticated client if token is available
export const authClient = HYGRAPH_AUTH_TOKEN
  ? new GraphQLClient(HYGRAPH_CONTENT_API, {
      headers: {
        authorization: `Bearer ${HYGRAPH_AUTH_TOKEN}`,
      },
    })
  : contentClient; // Fallback to non-authenticated client

export const cdnClient = new GraphQLClient(HYGRAPH_CDN_API);

// Helper function for read-only operations (uses CDN for better performance)
export const fetchFromCDN = async (query, variables = {}) => {
  try {
    // Add a timestamp parameter to the variables to bypass caching
    const timestampedVariables = {
      ...variables,
      _timestamp: new Date().getTime(),
    };

    const result = await cdnClient.request(query, timestampedVariables);
    return result;
  } catch (error) {
    console.error("Error fetching from Hygraph CDN:", error);

    // If CDN fails, try the content API as fallback
    try {
      console.log("Falling back to Content API due to CDN failure");
      const timestampedVariables = {
        ...variables,
        _timestamp: new Date().getTime(),
      };

      return await contentClient.request(query, timestampedVariables);
    } catch (fallbackError) {
      console.error("Fallback to Content API also failed:", fallbackError);
      throw error; // Throw the original error
    }
  }
};

// Export gql for convenience
export { gql };
```

## Fetching Data from Hygraph

Create a file `src/services/index.js` with functions to fetch specific data:

```javascript
import { fetchFromCDN, gql } from "./hygraph";

// Get featured posts
export const getFeaturedPosts = async () => {
  const query = gql`
    query GetFeaturedPosts {
      posts(where: { featuredpost: true }, first: 12, orderBy: createdAt_DESC) {
        author {
          name
          photo {
            url
          }
        }
        featuredImage {
          url
          width
          height
        }
        title
        slug
        createdAt
      }
    }
  `;
  
  try {
    const result = await fetchFromCDN(query);
    
    return result.posts.map((post) => ({
      ...post,
      featuredImage: {
        ...post.featuredImage,
        width: parseInt(post.featuredImage.width, 10) || 30,
        height: parseInt(post.featuredImage.height, 10) || 30,
      },
    }));
  } catch (error) {
    console.error("Error fetching featured posts:", error);
    return [];
  }
};

// Get post details by slug
export const getPostDetails = async (slug) => {
  const query = gql`
    query GetPostDetails($slug: String!) {
      post(where: { slug: $slug }) {
        title
        excerpt
        featuredImage {
          url
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
          raw
        }
        categories {
          name
          slug
        }
      }
    }
  `;

  try {
    const result = await fetchFromCDN(query, { slug });
    return result.post;
  } catch (error) {
    console.error(`Error fetching post details for slug: ${slug}`, error);
    return null;
  }
};

// Get categories
export const getCategories = async () => {
  const query = gql`
    query GetCategories {
      categories(where: { show: true }, orderBy: name_DESC) {
        name
        slug
      }
    }
  `;

  try {
    const result = await fetchFromCDN(query);
    return result.categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};
```

## Creating React Components

### FeaturedPostCard Component

Create a file `src/components/FeaturedPostCard.jsx`:

```jsx
import React from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';

// Default avatar for authors without photos
const DEFAULT_AVATAR = "https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper-thumbnail.png";

const FeaturedPostCard = ({ post }) => (
  <div className="relative h-72">
    <div className="absolute rounded-lg bg-center bg-no-repeat bg-cover shadow-md inline-block w-full h-72" 
         style={{ backgroundImage: `url('${post.featuredImage?.url || '/default-image.jpg'}')` }} />
    <div className="absolute rounded-lg bg-center bg-gradient-to-b opacity-50 from-gray-400 via-gray-700 to-black w-full h-72" />
    <div className="flex flex-col rounded-lg p-4 items-center justify-center absolute w-full h-full">
      <p className="text-white mb-4 text-shadow font-semibold text-xs">
        {moment(post.createdAt).format('MMM DD, YYYY')}
      </p>
      <p className="text-white mb-4 text-shadow font-semibold text-2xl text-center">
        {post.title}
      </p>
      <div className="flex items-center absolute bottom-5 w-full justify-center">
        <img
          alt={post.author?.name || 'Author'}
          height="30px"
          width="30px"
          className="align-middle drop-shadow-lg rounded-full"
          src={post.author?.photo?.url || DEFAULT_AVATAR}
        />
        <p className="inline align-middle text-white text-shadow ml-2 font-medium">
          {post.author?.name || 'Anonymous'}
        </p>
      </div>
    </div>
    <Link to={`/post/${post.slug}`}>
      <span className="cursor-pointer absolute w-full h-full" />
    </Link>
  </div>
);

export default FeaturedPostCard;
```

### PostCard Component

Create a file `src/components/PostCard.jsx`:

```jsx
import React from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';

// Default avatar for authors without photos
const DEFAULT_AVATAR = "https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper-thumbnail.png";

const PostCard = ({ post }) => (
  <div className="bg-white shadow-lg rounded-lg p-0 lg:p-8 pb-12 mb-8">
    <div className="relative overflow-hidden shadow-md pb-80 mb-6">
      {post.featuredImage?.url ? (
        <LazyLoadImage
          src={post.featuredImage.url}
          alt={post.title || "Featured image"}
          width={800}
          height={600}
          className="object-top absolute h-80 w-full object-cover shadow-lg rounded-t-lg lg:rounded-lg"
          style={{ width: "100%", height: "320px" }}
        />
      ) : (
        <div className="absolute h-80 w-full bg-gray-200 shadow-lg rounded-t-lg lg:rounded-lg flex items-center justify-center">
          <p className="text-gray-500">No image available</p>
        </div>
      )}
    </div>

    <h1 className="transition duration-700 text-center mb-8 cursor-pointer hover:text-pink-600 text-3xl font-semibold">
      <Link to={`/post/${post.slug}`}>{post.title}</Link>
    </h1>
    <div className="block lg:flex text-center items-center justify-center mb-8 w-full">
      <div className="flex items-center justify-center mb-4 lg:mb-0 w-full lg:w-auto mr-8">
        <img
          alt={post.author?.name || "Author"}
          height={30}
          width={30}
          className="align-middle rounded-full"
          src={post.author?.photo?.url || DEFAULT_AVATAR}
        />
        <p className="inline align-middle text-gray-700 ml-2 font-medium text-lg">
          {post.author?.name || "Anonymous"}
        </p>
      </div>
      <div className="font-medium text-gray-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 inline mr-2 text-pink-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="align-middle">
          {post.createdAt
            ? moment(post.createdAt).format("MMM DD, YYYY")
            : post.publishedAt
            ? moment(post.publishedAt).format("MMM DD, YYYY")
            : "No date"}
        </span>
      </div>
    </div>
    <p className="text-center text-lg text-gray-700 font-normal px-4 lg:px-20 mb-8 truncate md:text-clip">
      {post.excerpt || "Read this article to learn more..."}
    </p>
    <div className="text-center">
      <Link to={`/post/${post.slug}`}>
        <span className="transition duration-500 ease transform hover:-translate-y-1 inline-block bg-pink-600 text-lg font-medium rounded-full text-white px-8 py-3 cursor-pointer">
          Continue Reading
        </span>
      </Link>
    </div>
  </div>
);

export default PostCard;
```

## Example: Displaying Featured Posts

Create a file `src/components/FeaturedPosts.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import FeaturedPostCard from './FeaturedPostCard';
import { getFeaturedPosts } from '../services';

const FeaturedPosts = () => {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const posts = await getFeaturedPosts();
        setFeaturedPosts(posts);
      } catch (error) {
        console.error('Error fetching featured posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (isLoading) {
    return <div>Loading featured posts...</div>;
  }

  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold mb-8 text-center">Featured Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {featuredPosts.map((post) => (
          <FeaturedPostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedPosts;
```

## Example: Displaying Post Details

Create a file `src/components/PostDetail.jsx`:

```jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { getPostDetails } from '../services';

// Default values
const DEFAULT_AVATAR = "https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper-thumbnail.png";
const DEFAULT_FEATURED_IMAGE = "/default-image.jpg";

const PostDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const postData = await getPostDetails(slug);
        setPost(postData);
      } catch (error) {
        console.error('Error fetching post details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchPostDetails();
    }
  }, [slug]);

  if (isLoading) {
    return <div>Loading post...</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 pb-12 mb-8">
      <div className="relative overflow-hidden shadow-md mb-6">
        <img 
          src={post.featuredImage?.url || DEFAULT_FEATURED_IMAGE} 
          alt={post.title} 
          className="object-top h-full w-full rounded-t-lg"
        />
      </div>
      <div className="px-4 lg:px-0">
        <div className="flex items-center mb-8 w-full">
          <div className="flex items-center mb-4 lg:mb-0 w-full lg:w-auto mr-8">
            <img
              src={post.author?.photo?.url || DEFAULT_AVATAR}
              alt={post.author?.name || "Author"}
              height={30}
              width={30}
              className="align-middle rounded-full"
            />
            <p className="inline align-middle text-gray-700 ml-2 text-lg">
              {post.author?.name || "Anonymous"}
            </p>
          </div>
          <div className="font-medium text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 inline mr-2 text-pink-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="align-middle">
              {moment(post.createdAt || post.publishedAt).format('MMM DD, YYYY')}
            </span>
          </div>
        </div>
        <h1 className="mb-8 text-3xl font-semibold">{post.title}</h1>
        <div className="text-lg text-gray-700">
          {post.content?.raw?.children ? (
            <div dangerouslySetInnerHTML={{ 
              __html: post.content.raw.children
                .map(typeObj => {
                  if (typeObj.type === 'paragraph') {
                    return `<p>${typeObj.children.map(item => item.text).join('')}</p>`;
                  }
                  if (typeObj.type === 'heading-three') {
                    return `<h3>${typeObj.children.map(item => item.text).join('')}</h3>`;
                  }
                  if (typeObj.type === 'heading-four') {
                    return `<h4>${typeObj.children.map(item => item.text).join('')}</h4>`;
                  }
                  if (typeObj.type === 'image') {
                    return `<img src="${typeObj.src}" alt="${typeObj.title || 'image'}" height="${typeObj.height}" width="${typeObj.width}" />`;
                  }
                  return typeObj.children.map(item => item.text).join('');
                })
                .join('')
            }} />
          ) : (
            <p>No content available for this post.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
```

## Handling Images

For optimal image handling, you might want to use a library like `react-lazy-load-image-component` for lazy loading images:

```jsx
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

// Usage example
<LazyLoadImage
  src={imageUrl}
  alt={imageAlt}
  effect="blur"
  width={width}
  height={height}
/>
```

## Error Handling

Create a simple error boundary component to catch and handle errors:

```jsx
import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary p-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-gray-700 mb-4">
            We're sorry, but there was an error loading this component.
          </p>
          <details className="bg-white p-2 rounded border border-gray-200">
            <summary className="cursor-pointer font-medium">Error details</summary>
            <pre className="mt-2 text-sm overflow-auto p-2 bg-gray-100 rounded">
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

## Setting Up Routes

Create a file `src/App.jsx`:

```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FeaturedPosts from './components/FeaturedPosts';
import PostDetail from './components/PostDetail';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <Router>
      <div className="container mx-auto px-10 mb-8">
        <header className="border-b py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold">My Blog</h1>
          </div>
        </header>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<FeaturedPosts />} />
            <Route path="/post/:slug" element={<PostDetail />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;
```

## Conclusion

This guide provides the basic structure for integrating Hygraph with a React 19 project. You can expand on this foundation by adding more components, implementing pagination, adding search functionality, or integrating with other APIs.

Remember to:

1. Keep your authentication tokens secure
2. Implement proper error handling
3. Optimize image loading for better performance
4. Consider implementing caching strategies for frequently accessed data

## Environment Variables Reference

| Variable | Description | Example Value |
|----------|-------------|---------------|
| VITE_HYGRAPH_CONTENT_API | The Hygraph Content API endpoint | https://api-ap-south-1.hygraph.com/v2/cky5wgpym15ym01z44tk90zeb/master |
| VITE_HYGRAPH_CDN_API | The Hygraph CDN API endpoint | https://ap-south-1.cdn.hygraph.com/content/cky5wgpym15ym01z44tk90zeb/master |
| VITE_HYGRAPH_AUTH_TOKEN | Your Hygraph authentication token | eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImdjbXMtbWFpbi1wcm9kdWN0aW9uIn0... |
