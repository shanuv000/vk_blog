/**
 * TinyURL Management Component
 * Provides administrative interface for managing shortened URLs
 */
"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaLink,
  FaChartLine,
  FaCopy,
  FaCheck,
  FaExternalLinkAlt,
  FaRefresh,
  FaDownload,
  FaTrash,
} from 'react-icons/fa';
import { useBulkTinyUrl } from '../hooks/useTinyUrl';
import tinyUrlService from '../services/tinyurl';

const TinyUrlManager = ({ 
  posts = [], 
  showBulkActions = true,
  showAnalytics = true,
  className = "" 
}) => {
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [copySuccess, setCopySuccess] = useState({});
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Bulk URL shortening hook
  const {
    shortUrls,
    isLoading: bulkLoading,
    errors,
    progress,
    shortenAllUrls,
    getShortUrl,
    hasErrors,
    isCompleted,
  } = useBulkTinyUrl(selectedPosts);

  // Handle post selection
  const handlePostSelection = (post, isSelected) => {
    if (isSelected) {
      setSelectedPosts(prev => [...prev, post]);
    } else {
      setSelectedPosts(prev => prev.filter(p => p.slug !== post.slug));
    }
  };

  // Select all posts
  const handleSelectAll = (isSelectAll) => {
    setSelectedPosts(isSelectAll ? posts : []);
  };

  // Copy URL to clipboard
  const copyToClipboard = async (slug, url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(prev => ({ ...prev, [slug]: true }));
      setTimeout(() => {
        setCopySuccess(prev => ({ ...prev, [slug]: false }));
      }, 2000);
      return true;
    } catch (error) {
      console.error('Failed to copy URL:', error);
      return false;
    }
  };

  // Fetch analytics for all shortened URLs
  const fetchAllAnalytics = async () => {
    if (!showAnalytics) return;
    
    setIsLoadingAnalytics(true);
    const analyticsData = {};
    
    for (const post of posts) {
      const shortUrl = shortUrls[post.slug];
      if (shortUrl && shortUrl.includes('tinyurl.com')) {
        const alias = shortUrl.split('tinyurl.com/')[1];
        if (alias) {
          try {
            const data = await tinyUrlService.getAnalytics(alias);
            if (data) {
              analyticsData[post.slug] = data;
            }
          } catch (error) {
            console.error(`Failed to fetch analytics for ${post.slug}:`, error);
          }
        }
      }
    }
    
    setAnalytics(analyticsData);
    setIsLoadingAnalytics(false);
  };

  // Export URLs as CSV
  const exportUrlsAsCSV = () => {
    const csvContent = [
      ['Title', 'Slug', 'Long URL', 'Short URL', 'Clicks', 'Status'],
      ...posts.map(post => [
        post.title || 'Untitled',
        post.slug,
        `https://blog.urtechy.com/post/${post.slug}`,
        getShortUrl(post.slug),
        analytics[post.slug]?.clicks || 0,
        errors[post.slug] ? 'Error' : 'Success'
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tinyurl-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Effect to fetch analytics when URLs are ready
  useEffect(() => {
    if (isCompleted && Object.keys(shortUrls).length > 0) {
      fetchAllAnalytics();
    }
  }, [isCompleted, shortUrls]);

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FaLink className="mr-2 text-blue-600" />
            TinyURL Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage shortened URLs for your blog posts
          </p>
        </div>
        
        {showBulkActions && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAllAnalytics()}
              disabled={isLoadingAnalytics}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
            >
              <FaRefresh className={`mr-1 ${isLoadingAnalytics ? 'animate-spin' : ''}`} />
              Refresh Analytics
            </button>
            
            <button
              onClick={exportUrlsAsCSV}
              disabled={Object.keys(shortUrls).length === 0}
              className="flex items-center px-3 py-2 text-sm bg-green-100 hover:bg-green-200 text-green-800 rounded-md transition-colors disabled:opacity-50"
            >
              <FaDownload className="mr-1" />
              Export CSV
            </button>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {showBulkActions && (
        <motion.div
          className="mb-6 p-4 bg-gray-50 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedPosts.length === posts.length && posts.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Select All ({posts.length} posts)
                </span>
              </label>
              
              {selectedPosts.length > 0 && (
                <span className="text-sm text-blue-600">
                  {selectedPosts.length} selected
                </span>
              )}
            </div>

            <button
              onClick={shortenAllUrls}
              disabled={bulkLoading || selectedPosts.length === 0}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
            >
              {bulkLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Shortening... ({progress.completed}/{progress.total})
                </>
              ) : (
                <>
                  <FaLink className="mr-2" />
                  Shorten Selected URLs
                </>
              )}
            </button>
          </div>

          {/* Progress Bar */}
          {bulkLoading && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.completed / progress.total) * 100}%` }}
              />
            </div>
          )}

          {/* Bulk Results Summary */}
          {isCompleted && (
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className="text-green-600">
                ✓ {Object.keys(shortUrls).length} URLs processed
              </span>
              {hasErrors && (
                <span className="text-orange-600">
                  ⚠ {Object.keys(errors).length} errors
                </span>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Posts List */}
      <div className="space-y-3">
        {posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaLink className="mx-auto mb-2 text-2xl" />
            <p>No posts available</p>
          </div>
        ) : (
          posts.map((post, index) => (
            <motion.div
              key={post.slug}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  {showBulkActions && (
                    <input
                      type="checkbox"
                      checked={selectedPosts.some(p => p.slug === post.slug)}
                      onChange={(e) => handlePostSelection(post, e.target.checked)}
                      className="mt-1 mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 mb-1 line-clamp-1">
                      {post.title || 'Untitled Post'}
                    </h3>
                    
                    {/* URLs */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 w-12">Long:</span>
                        <code className="flex-1 bg-gray-100 px-2 py-1 rounded text-xs font-mono truncate">
                          https://blog.urtechy.com/post/{post.slug}
                        </code>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 w-12">Short:</span>
                        {shortUrls[post.slug] ? (
                          <div className="flex-1 flex items-center gap-2">
                            <code className="flex-1 bg-blue-50 px-2 py-1 rounded text-xs font-mono truncate text-blue-800">
                              {shortUrls[post.slug]}
                            </code>
                            <button
                              onClick={() => copyToClipboard(post.slug, shortUrls[post.slug])}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Copy short URL"
                            >
                              {copySuccess[post.slug] ? (
                                <FaCheck className="text-green-600" size={12} />
                              ) : (
                                <FaCopy className="text-gray-600" size={12} />
                              )}
                            </button>
                            <a
                              href={shortUrls[post.slug]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 hover:bg-gray-100 rounded text-gray-600"
                              title="Open short URL"
                            >
                              <FaExternalLinkAlt size={12} />
                            </a>
                          </div>
                        ) : errors[post.slug] ? (
                          <span className="flex-1 text-red-600 text-xs">
                            Error: {errors[post.slug]}
                          </span>
                        ) : (
                          <span className="flex-1 text-gray-400 text-xs">
                            Not generated
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Analytics */}
                    {showAnalytics && analytics[post.slug] && (
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <FaChartLine />
                          <span>Clicks: {analytics[post.slug].clicks || 0}</span>
                        </div>
                        <div>
                          Last 7 days: {analytics[post.slug].recent_clicks || 0}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Service Status */}
      <motion.div
        className="mt-6 pt-4 border-t border-gray-200 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <div className={`w-2 h-2 rounded-full ${
            tinyUrlService.isConfigured() ? 'bg-green-500' : 'bg-orange-500'
          }`} />
          <span>
            TinyURL Service: {tinyUrlService.isConfigured() ? 'Active' : 'Not Configured'}
          </span>
        </div>
        {!tinyUrlService.isConfigured() && (
          <p className="text-xs text-orange-600 mt-1">
            Add TINYURL_API_KEY to environment variables to enable URL shortening
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default TinyUrlManager;