/**
 * Example page demonstrating TinyURL integration
 * Visit: /tinyurl-demo
 */
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import EnhancedSocialShare from '../components/EnhancedSocialShare';
import TinyUrlManager from '../components/TinyUrlManager';
import { useTinyUrl } from '../hooks/useTinyUrl';

// Demo post data
const demoPost = {
  slug: 'tinyurl-integration-demo',
  title: 'TinyURL Integration Demo - Shorter URLs for Better Sharing',
  excerpt: 'Demonstrating the power of TinyURL integration for enhanced social sharing and analytics.',
  featuredImage: {
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=630&fit=crop'
  },
  author: {
    name: 'urTechy Team',
    bio: 'Technology enthusiasts sharing the latest insights.',
    photo: {
      url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    }
  },
  createdAt: new Date().toISOString(),
  publishedAt: new Date().toISOString(),
  categories: [
    { name: 'Technology', slug: 'technology' },
    { name: 'Web Development', slug: 'web-development' }
  ]
};

// Sample posts for bulk demo
const samplePosts = [
  {
    slug: 'artificial-intelligence-future',
    title: 'The Future of Artificial Intelligence in Web Development',
    featuredImage: { url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop' }
  },
  {
    slug: 'react-19-features',
    title: 'React 19: New Features and Performance Improvements',
    featuredImage: { url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop' }
  },
  {
    slug: 'nextjs-optimization-guide',
    title: 'Complete Guide to Next.js Performance Optimization',
    featuredImage: { url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=200&fit=crop' }
  }
];

export default function TinyUrlDemo() {
  const [showBulkDemo, setShowBulkDemo] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [manualShortUrl, setManualShortUrl] = useState('');

  // Demo hook usage
  const {
    shortUrl,
    longUrl,
    isLoading,
    error,
    isShortened,
    copyToClipboard,
    getSharingUrls,
  } = useTinyUrl(demoPost, {
    autoShorten: true,
    baseUrl: 'https://blog.urtechy.com',
  });

  // Manual URL shortening demo
  const handleManualShorten = async () => {
    if (!customUrl) return;

    try {
      const response = await fetch('/api/tinyurl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: customUrl }),
      });

      const result = await response.json();
      setManualShortUrl(result.shortUrl);
    } catch (err) {
      console.error('Error shortening URL:', err);
      setManualShortUrl('Error creating short URL');
    }
  };

  return (
    <Layout>
      <Head>
        <title>TinyURL Integration Demo - urTechy Blog</title>
        <meta 
          name="description" 
          content="Demonstration of TinyURL integration for enhanced social sharing and URL management" 
        />
      </Head>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            TinyURL Integration Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience how TinyURL integration enhances your blog's sharing capabilities 
            with shortened URLs, analytics, and seamless social media integration.
          </p>
        </motion.div>

        {/* Demo Sections */}
        <div className="space-y-12">
          
          {/* 1. Basic Hook Usage Demo */}
          <motion.section
            className="bg-white rounded-lg shadow-sm border p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <h2 className="text-2xl font-semibold mb-6">1. Automatic URL Shortening</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-800 mb-3">Demo Post</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm">{demoPost.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">Slug: {demoPost.slug}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 mb-3">URL Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Original URL:</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {longUrl?.substring(0, 30)}...
                    </code>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Short URL:</span>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-3 h-3 border border-gray-300 border-t-blue-600 rounded-full" />
                        <span className="text-xs text-blue-600">Creating...</span>
                      </div>
                    ) : shortUrl ? (
                      <code className="text-xs bg-green-50 text-green-800 px-2 py-1 rounded">
                        {shortUrl}
                      </code>
                    ) : error ? (
                      <span className="text-xs text-red-600">Error</span>
                    ) : (
                      <span className="text-xs text-gray-400">Not generated</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      isShortened 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isShortened ? 'Shortened' : 'Original'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={copyToClipboard}
                  className="mt-3 w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  disabled={isLoading}
                >
                  Copy {isShortened ? 'Short' : 'Long'} URL
                </button>
              </div>
            </div>
          </motion.section>

          {/* 2. Enhanced Social Sharing Demo */}
          <motion.section
            className="bg-white rounded-lg shadow-sm border p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className="text-2xl font-semibold mb-6">2. Enhanced Social Sharing</h2>
            
            <div className="space-y-6">
              {/* Default Variant */}
              <div>
                <h3 className="font-medium text-gray-800 mb-3">Default Variant</h3>
                <EnhancedSocialShare 
                  post={demoPost}
                  enableTinyUrl={true}
                  variant="default"
                />
              </div>

              {/* Compact Variant */}
              <div>
                <h3 className="font-medium text-gray-800 mb-3">Compact Variant</h3>
                <EnhancedSocialShare 
                  post={demoPost}
                  enableTinyUrl={true}
                  variant="compact"
                />
              </div>

              {/* Minimal Variant */}
              <div>
                <h3 className="font-medium text-gray-800 mb-3">Minimal Variant</h3>
                <EnhancedSocialShare 
                  post={demoPost}
                  enableTinyUrl={true}
                  variant="minimal"
                />
              </div>
            </div>
          </motion.section>

          {/* 3. Manual URL Shortening Demo */}
          <motion.section
            className="bg-white rounded-lg shadow-sm border p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h2 className="text-2xl font-semibold mb-6">3. Manual URL Shortening</h2>
            
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter any URL to shorten:
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/very/long/url"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleManualShorten}
                  disabled={!customUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Shorten
                </button>
              </div>
              
              {manualShortUrl && (
                <div className="mt-3 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600 mb-1">Short URL:</p>
                  <code className="text-sm font-mono text-blue-800 break-all">
                    {manualShortUrl}
                  </code>
                </div>
              )}
            </div>
          </motion.section>

          {/* 4. Bulk Management Demo */}
          <motion.section
            className="bg-white rounded-lg shadow-sm border p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h2 className="text-2xl font-semibold mb-6">4. Bulk URL Management</h2>
            
            <div className="mb-4">
              <button
                onClick={() => setShowBulkDemo(!showBulkDemo)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                {showBulkDemo ? 'Hide' : 'Show'} Bulk Management Demo
              </button>
            </div>

            {showBulkDemo && (
              <TinyUrlManager 
                posts={samplePosts}
                showBulkActions={true}
                showAnalytics={false}
              />
            )}
          </motion.section>

          {/* 5. Integration Code Examples */}
          <motion.section
            className="bg-white rounded-lg shadow-sm border p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <h2 className="text-2xl font-semibold mb-6">5. Integration Examples</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Basic Hook Usage</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import { useTinyUrl } from '../hooks/useTinyUrl';

const { shortUrl, longUrl, isLoading, copyToClipboard } = useTinyUrl(post, {
  autoShorten: true,
  baseUrl: 'https://blog.urtechy.com'
});`}
                </pre>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 mb-2">API Usage</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`const response = await fetch('/api/tinyurl', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ post: { slug: 'my-post', title: 'My Post' } })
});

const { shortUrl, isShortened } = await response.json();`}
                </pre>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 mb-2">Enhanced Social Sharing</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`<EnhancedSocialShare 
  post={post}
  enableTinyUrl={true}
  showAnalytics={true}
  variant="default"
/>`}
                </pre>
              </div>
            </div>
          </motion.section>

        </div>

        {/* Footer */}
        <motion.div
          className="text-center mt-12 pt-8 border-t border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <p className="text-gray-600">
            🔗 TinyURL Integration is now active on your urTechy Blog! 
            <br />
            All new posts will automatically generate shortened URLs for better sharing.
          </p>
          
          <div className="mt-4 flex justify-center gap-4">
            <a
              href="/TINYURL_INTEGRATION_GUIDE.md"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              📚 Read Integration Guide
            </a>
            <a
              href="https://tinyurl.com/app/myurls"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              📊 View TinyURL Dashboard
            </a>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}

// Optional: Add this to your routing or navigation
export async function getStaticProps() {
  return {
    props: {
      // You can add any server-side data here if needed
    },
  };
}