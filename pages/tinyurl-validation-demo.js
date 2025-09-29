/**
 * TinyURL Validation Demo Page
 * Test and demonstrate the enhanced TinyURL system with proper validation
 */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import EnhancedSocialSharePost from "../components/EnhancedSocialSharePost";
import { useTinyUrl, useBulkTinyUrl } from "../hooks/useTinyUrlEnhanced";
import {
  validatePostTinyUrl,
  categorizePosts,
  generateValidationReport,
  formatDisplayDate,
} from "../utils/tinyUrlValidation";

const TinyUrlValidationDemo = () => {
  const [activeTab, setActiveTab] = useState("single");
  const [demoPost, setDemoPost] = useState(null);
  const [validationReport, setValidationReport] = useState(null);

  // Sample posts for testing (mix of new and legacy)
  const samplePosts = [
    {
      slug: "new-post-with-tinyurl",
      title: "New Post That Should Have TinyURL",
      publishedAt: "2025-09-29T10:00:00Z", // After integration
      featuredImage: { url: "https://via.placeholder.com/600x400" },
    },
    {
      slug: "legacy-post-before-integration",
      title: "Legacy Post Before TinyURL Integration",
      publishedAt: "2025-09-25T10:00:00Z", // Before integration
      featuredImage: { url: "https://via.placeholder.com/600x400" },
    },
    {
      slug: "another-new-post",
      title: "Another New Post with TinyURL Support",
      publishedAt: "2025-09-30T15:30:00Z", // After integration
      featuredImage: { url: "https://via.placeholder.com/600x400" },
    },
    {
      slug: "old-popular-post",
      title: "Old Popular Post (Legacy)",
      publishedAt: "2025-09-20T08:00:00Z", // Before integration
      views: 1000,
      featured: true,
    },
  ];

  // Bulk TinyURL hook for testing
  const {
    shortUrls,
    isLoading: bulkLoading,
    shortenAllUrls,
    progress,
    validationResults,
    eligiblePosts,
    totalEligible,
    totalOriginal,
  } = useBulkTinyUrl(samplePosts, {
    onlyNewPosts: true,
  });

  // Generate validation report on mount
  useEffect(() => {
    const report = generateValidationReport(samplePosts);
    setValidationReport(report);
    setDemoPost(samplePosts[0]); // Set first post as demo
  }, []);

  const ValidationCard = ({ validation, post }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border-l-4 ${
        validation.isNewPost
          ? "border-l-green-500 bg-green-50"
          : "border-l-gray-400 bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-800">{post.title}</h4>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            validation.isNewPost
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {validation.isNewPost ? "New Post" : "Legacy Post"}
        </span>
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Slug:</span>
          <code className="text-xs bg-white px-1 rounded">{post.slug}</code>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Published:</span>
          <span className="text-xs">
            {formatDisplayDate(validation.publishDate)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">TinyURL Eligible:</span>
          <span
            className={`text-xs font-medium ${
              validation.shouldHaveUrl ? "text-green-600" : "text-gray-500"
            }`}
          >
            {validation.shouldHaveUrl ? "Yes" : "No"}
          </span>
        </div>
      </div>

      {validation.reasons.length > 0 && (
        <div className="mt-2 text-xs text-red-600">
          Issues: {validation.reasons.join(", ")}
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            TinyURL Validation System Demo
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Test and demonstrate the enhanced TinyURL integration with smart
            validation that distinguishes between new posts (with TinyURLs) and
            legacy posts.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            {[
              { id: "single", label: "Single Post Test" },
              { id: "validation", label: "Validation Report" },
              { id: "bulk", label: "Bulk Processing" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Single Post Test */}
          {activeTab === "single" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Post Selection */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Select Test Post</h3>
                <div className="space-y-3">
                  {samplePosts.map((post) => {
                    const validation = validatePostTinyUrl(post);
                    return (
                      <button
                        key={post.slug}
                        onClick={() => setDemoPost(post)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          demoPost?.slug === post.slug
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">
                              {post.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDisplayDate(post.publishedAt)}
                            </div>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              validation.isNewPost
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {validation.isNewPost ? "New" : "Legacy"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Social Share Demo */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Social Share Preview
                </h3>
                {demoPost ? (
                  <EnhancedSocialSharePost post={demoPost} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Select a post to see social sharing preview
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Validation Report */}
          {activeTab === "validation" && validationReport && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Validation Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {validationReport.summary.totalPosts}
                    </div>
                    <div className="text-sm text-gray-600">Total Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {validationReport.summary.newPosts}
                    </div>
                    <div className="text-sm text-gray-600">New Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {validationReport.summary.legacyPosts}
                    </div>
                    <div className="text-sm text-gray-600">Legacy Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {validationReport.summary.invalidPosts}
                    </div>
                    <div className="text-sm text-gray-600">Invalid Posts</div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {validationReport.recommendations.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Recommendations
                  </h3>
                  <div className="space-y-3">
                    {validationReport.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-l-4 ${
                          rec.type === "success"
                            ? "border-l-green-500 bg-green-50"
                            : rec.type === "warning"
                            ? "border-l-yellow-500 bg-yellow-50"
                            : rec.type === "error"
                            ? "border-l-red-500 bg-red-50"
                            : "border-l-blue-500 bg-blue-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{rec.title}</h4>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              rec.priority === "high"
                                ? "bg-red-100 text-red-700"
                                : rec.priority === "medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {rec.priority} priority
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {rec.description}
                        </p>
                        <p className="text-sm font-medium">{rec.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Post Details */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Post Validation Details
                </h3>
                <div className="space-y-4">
                  {samplePosts.map((post) => {
                    const validation = validatePostTinyUrl(post);
                    return (
                      <ValidationCard
                        key={post.slug}
                        validation={validation}
                        post={post}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Bulk Processing */}
          {activeTab === "bulk" && (
            <div className="space-y-6">
              {/* Bulk Stats */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Bulk TinyURL Processing
                  </h3>
                  <button
                    onClick={shortenAllUrls}
                    disabled={bulkLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {bulkLoading ? "Processing..." : "Start Bulk Creation"}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {totalOriginal}
                    </div>
                    <div className="text-sm text-gray-600">Total Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      {totalEligible}
                    </div>
                    <div className="text-sm text-gray-600">
                      Eligible for TinyURL
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">
                      {Object.keys(shortUrls).length}
                    </div>
                    <div className="text-sm text-gray-600">URLs Created</div>
                  </div>
                </div>

                {/* Progress Bar */}
                {bulkLoading && progress.total > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>
                        {progress.completed} / {progress.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            (progress.completed / progress.total) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Results */}
              {Object.keys(shortUrls).length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Generated URLs</h3>
                  <div className="space-y-3">
                    {Object.entries(shortUrls).map(([slug, url]) => (
                      <div
                        key={slug}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-sm">{slug}</div>
                          <code className="text-xs text-gray-600">{url}</code>
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText(url)}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Copy
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TinyUrlValidationDemo;
