import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const TestPost = () => {
  const [slug, setSlug] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // List of known problematic slugs for quick testing
  const knownSlugs = [
    "nvidia-rtx-5060-ti-8gb-performance-issues-pcie-4-0-vram",
    "marvel-benedict-cumberbatch-mcu-anchor",
    "ipl-media-rights-cofused-about-packages",
    "ipl-2025-riyan-parag-six-consecutive-sixes-kkr-vs-rr",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!slug) {
      setError('Please enter a post slug');
      return;
    }
    
    setLoading(true);
    setError('');
    setResults(null);
    
    try {
      // Test the post using our diagnostics API
      const response = await fetch(`/api/post-diagnostics?slug=${encodeURIComponent(slug)}`);
      const data = await response.json();
      
      setResults(data);
    } catch (err) {
      setError(`Error testing post: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTest = async (testSlug) => {
    setSlug(testSlug);
    
    setLoading(true);
    setError('');
    setResults(null);
    
    try {
      // Test the post using our diagnostics API
      const response = await fetch(`/api/post-diagnostics?slug=${encodeURIComponent(testSlug)}`);
      const data = await response.json();
      
      setResults(data);
    } catch (err) {
      setError(`Error testing post: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Post Testing Tool | urTechy Blog</title>
      </Head>
      
      <h1 className="text-3xl font-bold mb-6">Post Testing Tool</h1>
      <p className="mb-6 text-gray-700">
        Use this tool to test if a post can be fetched and processed correctly.
      </p>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Quick Test Known Posts</h2>
        <div className="flex flex-wrap gap-2">
          {knownSlugs.map((testSlug) => (
            <button
              key={testSlug}
              onClick={() => handleQuickTest(testSlug)}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md hover:bg-blue-200"
            >
              {testSlug}
            </button>
          ))}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="slug" className="block text-gray-700 mb-2">
            Post Slug
          </label>
          <input
            type="text"
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            placeholder="enter-post-slug-here"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Post'}
        </button>
      </form>
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {results && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Test Results</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-bold mb-2">Post Slug</h3>
                <p className="break-all">{results.slug}</p>
              </div>
              
              <div>
                <h3 className="font-bold mb-2">Status</h3>
                <p className={results.success ? 'text-green-600' : 'text-red-600'}>
                  {results.success ? 'Success' : 'Failed'}
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-2">Processing Time</h3>
                <p>{results.processingTime}ms</p>
              </div>
              
              <div>
                <h3 className="font-bold mb-2">Timestamp</h3>
                <p>{new Date(results.timestamp).toLocaleString()}</p>
              </div>
            </div>
            
            {results.data && (
              <div className="mb-4">
                <h3 className="font-bold mb-2">Post Data</h3>
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <p><strong>Title:</strong> {results.data.title}</p>
                  {results.data.excerpt && (
                    <p><strong>Excerpt:</strong> {results.data.excerpt}</p>
                  )}
                  <p><strong>Has Content:</strong> {results.data.hasContent ? 'Yes' : 'No'}</p>
                  <p><strong>Content Type:</strong> {results.data.contentType}</p>
                  <p><strong>Has Featured Image:</strong> {results.data.hasFeaturedImage ? 'Yes' : 'No'}</p>
                  <p><strong>Has Author:</strong> {results.data.hasAuthor ? 'Yes' : 'No'}</p>
                  {results.data.categoriesCount !== undefined && (
                    <p><strong>Categories Count:</strong> {results.data.categoriesCount}</p>
                  )}
                  {results.data.createdAt && (
                    <p><strong>Created At:</strong> {new Date(results.data.createdAt).toLocaleString()}</p>
                  )}
                </div>
              </div>
            )}
            
            <div>
              <h3 className="font-bold mb-2">Fetch Attempts</h3>
              <div className="space-y-2">
                {results.attempts.map((attempt, index) => (
                  <div key={index} className={`p-3 rounded-md ${attempt.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <p><strong>Method:</strong> {attempt.method}</p>
                    <p><strong>Success:</strong> {attempt.success ? 'Yes' : 'No'}</p>
                    <p><strong>Time:</strong> {attempt.time}ms</p>
                    {attempt.error && <p><strong>Error:</strong> {attempt.error}</p>}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 flex space-x-4">
              <Link href={`/post/${results.slug}`} target="_blank" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                View Post Page
              </Link>
              <Link href={`/api/debug-post?slug=${results.slug}`} target="_blank" className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                View API Debug
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPost;
