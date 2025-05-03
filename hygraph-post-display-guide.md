# Hygraph Post Display Guide for React 19

This guide explains how posts are displayed in the current Next.js blog application, so you can implement similar functionality in your React 19 project.

## Table of Contents

1. [Data Structure](#data-structure)
2. [GraphQL Queries](#graphql-queries)
3. [Post Detail Component](#post-detail-component)
4. [Content Rendering](#content-rendering)
5. [Social Sharing](#social-sharing)
6. [Related Components](#related-components)
7. [React 19 Implementation](#react-19-implementation)

## Data Structure

Posts in Hygraph have the following structure:

```javascript
{
  title: String,
  excerpt: String,
  featuredImage: {
    url: String
  },
  author: {
    name: String,
    bio: String,
    photo: {
      url: String
    }
  },
  createdAt: Date,
  slug: String,
  content: {
    raw: Object // Rich text content
  },
  categories: [
    {
      name: String,
      slug: String
    }
  ]
}
```

## GraphQL Queries

### Post Details Query

```javascript
const POST_DETAILS_QUERY = gql`
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
```

### Fetching Post Data

```javascript
// Using Apollo Client
export const getPostDetails = async (slug) => {
  try {
    const { data } = await client.query({
      query: POST_DETAILS_QUERY,
      variables: { slug },
      fetchPolicy: "cache-first",
    });
    
    return data.post;
  } catch (error) {
    console.error(`Error fetching post details: ${error}`);
    return null;
  }
};
```

## Post Detail Component

The PostDetail component is responsible for displaying a single post. Here's a simplified version for React 19:

```jsx
import React, { useEffect } from 'react';
import moment from 'moment';
import { motion, useScroll, useSpring } from 'framer-motion';
import SocialSharing from './SocialSharing';
import ContentRenderer from './ContentRenderer';

// Default values for missing data
const DEFAULT_AVATAR = "/default-avatar.png";
const DEFAULT_FEATURED_IMAGE = "/default-featured-image.jpg";

const PostDetail = ({ post }) => {
  // Scroll progress animation
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    // Scroll to top when post loads
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!post) return <div>Post not found</div>;

  return (
    <motion.div
      className="bg-white shadow-lg rounded-lg p-6 pb-12 mb-8"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Reading progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-2 bg-orange-500 origin-left"
        style={{ scaleX }}
      />
      
      {/* Featured Image */}
      <div className="relative overflow-hidden shadow-md mb-6">
        <motion.img
          src={post.featuredImage?.url || DEFAULT_FEATURED_IMAGE}
          alt={post.title || "Post image"}
          className="object-top h-full w-full rounded-t-lg"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <div className="px-4 lg:px-0">
        {/* Author and Date */}
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
            <span>
              {post.createdAt
                ? moment(post.createdAt).format("DD MMM, YYYY")
                : "No date"}
            </span>
          </div>
        </div>
        
        {/* Social Sharing */}
        <SocialSharing post={post} />
        
        {/* Post Title */}
        <h1 className="mb-8 text-3xl font-semibold">
          {post.title}
        </h1>
        
        {/* Post Content */}
        <ContentRenderer content={post.content} />
      </div>
    </motion.div>
  );
};

export default PostDetail;
```

## Content Rendering

The content from Hygraph is in a rich text format that needs special handling. The `getContentFragment` function processes different content types:

```jsx
// ContentRenderer.jsx
import React from 'react';

const ContentRenderer = ({ content }) => {
  if (!content?.raw?.children) {
    return (
      <p className="text-center text-lg text-gray-700 font-normal">
        No content available for this post.
      </p>
    );
  }

  return (
    <>
      {content.raw.children.map((typeObj, index) => {
        const children = typeObj.children.map((item, itemIndex) => 
          getContentFragment(itemIndex, item.text, item)
        );

        return getContentFragment(index, children, typeObj, typeObj.type);
      })}
    </>
  );
};

// Helper function to render different content types
const getContentFragment = (index, text, obj, type) => {
  let modifiedText = text;

  switch (type) {
    case 'heading-one':
      return (
        <h1 key={index} className="text-4xl font-bold mb-8">
          {modifiedText.map((item, i) => <React.Fragment key={i}>{item}</React.Fragment>)}
        </h1>
      );
    
    case 'heading-two':
      return (
        <h2 key={index} className="text-3xl font-medium mb-6">
          {modifiedText.map((item, i) => <React.Fragment key={i}>{item}</React.Fragment>)}
        </h2>
      );
    
    case 'heading-three':
      return (
        <h3 key={index} className="text-2xl mb-4">
          {modifiedText.map((item, i) => <React.Fragment key={i}>{item}</React.Fragment>)}
        </h3>
      );
    
    case 'paragraph':
      return (
        <p key={index} className="mb-6 text-lg">
          {modifiedText.map((item, i) => {
            if (typeof item === 'string') {
              return <span key={i}>{item}</span>;
            }
            
            // Handle links, bold, italic, etc.
            if (item.bold) {
              return <b key={i}>{item.text}</b>;
            }
            
            if (item.italic) {
              return <em key={i}>{item.text}</em>;
            }
            
            if (item.underline) {
              return <u key={i}>{item.text}</u>;
            }
            
            if (item.type === 'link') {
              return (
                <a 
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {item.children[0].text}
                </a>
              );
            }
            
            return <span key={i}>{item.text}</span>;
          })}
        </p>
      );
    
    case 'image':
      return (
        <img
          key={index}
          alt={obj.title || 'Image'}
          height={obj.height}
          width={obj.width}
          src={obj.src}
          className="rounded-lg my-4 shadow-lg"
        />
      );
    
    case 'bulleted-list':
      return (
        <ul key={index} className="list-disc list-inside mb-6">
          {obj.children.map((listItem, i) => (
            <li key={i} className="mb-2">
              {listItem.children[0].children.map((item, j) => (
                <React.Fragment key={j}>{item.text}</React.Fragment>
              ))}
            </li>
          ))}
        </ul>
      );
    
    case 'numbered-list':
      return (
        <ol key={index} className="list-decimal list-inside mb-6">
          {obj.children.map((listItem, i) => (
            <li key={i} className="mb-2">
              {listItem.children[0].children.map((item, j) => (
                <React.Fragment key={j}>{item.text}</React.Fragment>
              ))}
            </li>
          ))}
        </ol>
      );
    
    case 'block-quote':
      return (
        <blockquote key={index} className="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-3">
          {modifiedText.map((item, i) => (
            <React.Fragment key={i}>{item}</React.Fragment>
          ))}
        </blockquote>
      );
    
    default:
      return modifiedText;
  }
};

export default ContentRenderer;
```

## Social Sharing

The social sharing component displays buttons to share the post on various platforms:

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  FaXTwitter,
  FaFacebook,
  FaReddit,
  FaWhatsapp,
  FaLinkedin,
  FaPinterest,
  FaInstagram,
} from 'react-icons/fa6';

const SocialSharing = ({ post }) => {
  // Safely extract properties with fallbacks
  const title = post?.title || "Blog Post";
  const slug = post?.slug || "";
  const rootUrl = "https://blog.urtechy.com";
  const postUrl = `${rootUrl}/post/${slug}`;
  const imageUrl = post?.featuredImage?.url || "";

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center space-x-4 mb-4"
    >
      <a
        href={`https://wa.me/?text=${encodeURIComponent(
          `${title} - ${postUrl}${imageUrl ? " 📷" : ""}`
        )}`}
        data-action="share/whatsapp/share"
        className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 transition-colors duration-300"
        title="Share on WhatsApp"
        aria-label="Share on WhatsApp"
      >
        <FaWhatsapp size={20} className="text-white" />
      </a>
      
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          postUrl
        )}&picture=${encodeURIComponent(imageUrl)}&quote=${encodeURIComponent(
          title
        )}`}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
        title="Share on Facebook"
        aria-label="Share on Facebook"
      >
        <FaFacebook size={20} className="text-white" />
      </a>
      
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
          title
        )}&url=${encodeURIComponent(postUrl)}`}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-black hover:bg-gray-800 transition-colors duration-300"
        title="Share on Twitter"
        aria-label="Share on Twitter"
      >
        <FaXTwitter size={20} className="text-white" />
      </a>
      
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          postUrl
        )}&title=${encodeURIComponent(title)}`}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-800 hover:bg-blue-900 transition-colors duration-300"
        title="Share on LinkedIn"
        aria-label="Share on LinkedIn"
      >
        <FaLinkedin size={20} className="text-white" />
      </a>
      
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`http://pinterest.com/pin/create/button/?url=${encodeURIComponent(
          postUrl
        )}&description=${encodeURIComponent(title)}&media=${encodeURIComponent(
          imageUrl
        )}`}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 transition-colors duration-300"
        title="Share on Pinterest"
        aria-label="Share on Pinterest"
      >
        <FaPinterest size={20} className="text-white" />
      </a>
    </motion.nav>
  );
};

export default SocialSharing;
```

## Related Components

The post display system includes several related components:

1. **PostWidget** - Shows related or recent posts
2. **Author** - Displays author information
3. **Comments** - Shows comments for the post
4. **CommentsForm** - Allows users to submit comments
5. **AdjacentPosts** - Shows previous and next posts

## React 19 Implementation

To implement this in React 19, you'll need to:

1. **Set up Apollo Client**:

```jsx
// src/lib/apollo-client.js
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const createApolloClient = () => {
  return new ApolloClient({
    link: new HttpLink({
      uri: 'https://ap-south-1.cdn.hygraph.com/content/cky5wgpym15ym01z44tk90zeb/master',
    }),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            posts: {
              merge(existing, incoming) {
                return incoming;
              },
            },
            post: {
              merge(existing, incoming) {
                return incoming;
              },
            },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  });
};

export default createApolloClient();
```

2. **Create a Post Page Component**:

```jsx
// src/pages/Post.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { POST_DETAILS_QUERY } from '../graphql/queries';
import PostDetail from '../components/PostDetail';
import Author from '../components/Author';
import PostWidget from '../components/PostWidget';
import Categories from '../components/Categories';
import Comments from '../components/Comments';
import CommentsForm from '../components/CommentsForm';
import Loader from '../components/Loader';

const Post = () => {
  const { slug } = useParams();
  
  const { loading, error, data } = useQuery(POST_DETAILS_QUERY, {
    variables: { slug },
    fetchPolicy: 'cache-and-network',
  });
  
  if (loading) return <Loader />;
  
  if (error) {
    console.error('Error fetching post:', error);
    return (
      <div className="container mx-auto px-10 mb-8 text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Error Loading Post</h1>
        <p className="mb-8">
          There was an error loading this post. Please try again later.
        </p>
      </div>
    );
  }
  
  if (!data?.post) {
    return (
      <div className="container mx-auto px-10 mb-8 text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
        <p className="mb-8">
          The post you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }
  
  const post = data.post;
  
  return (
    <div className="container mx-auto px-10 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="col-span-1 lg:col-span-8">
          <PostDetail post={post} />
          {post.author && <Author author={post.author} />}
          <CommentsForm slug={post.slug} />
          <Comments slug={post.slug} />
        </div>
        <div className="col-span-1 lg:col-span-4">
          <div className="relative lg:sticky top-8">
            <PostWidget
              slug={post.slug}
              categories={post.categories?.map((category) => category.slug) || []}
            />
            <Categories />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
```

3. **Set up Routing**:

```jsx
// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import apolloClient from './lib/apollo-client';
import Header from './components/Header';
import Home from './pages/Home';
import Post from './pages/Post';
import Category from './pages/Category';

const App = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:slug" element={<Post />} />
          <Route path="/category/:slug" element={<Category />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
};

export default App;
```

This implementation provides a solid foundation for displaying posts from Hygraph in your React 19 application, following the same patterns used in your current Next.js application.
