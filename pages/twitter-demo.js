import React from "react";
import { TwitterTweetEmbed } from "react-twitter-embed";
import Layout from "../components/Layout";
import TwitterPost from "../components/TwitterPost";
import TwitterUserFeed from "../components/TwitterUserFeed";

const TwitterDemo = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Twitter Integration Demo
          </h1>

          {/* API Version Demo */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              New Twitter API v2 Integration
            </h2>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Single Tweet Display (Using API)
              </h3>
              <TwitterPost tweetId="1790555395041472948" />
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                User Timeline Feed (Using API)
              </h3>
              <TwitterUserFeed username="elonmusk" count={3} />
            </div>
          </section>

          {/* Legacy Version Demo */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Legacy Twitter Embed (For Comparison)
            </h2>
            <div className="border border-gray-200 rounded-lg p-4">
              <TwitterTweetEmbed tweetId="1790555395041472948" />
            </div>
          </section>

          {/* Usage Examples */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Usage Examples
            </h2>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Code Examples
              </h3>

              <div className="mb-6">
                <h4 className="font-medium text-gray-600 mb-2">
                  Single Tweet:
                </h4>
                <code className="block bg-white p-3 rounded border text-sm">
                  {`<TwitterPost tweetId="1790555395041472948" />`}
                </code>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-600 mb-2">User Feed:</h4>
                <code className="block bg-white p-3 rounded border text-sm">
                  {`<TwitterUserFeed username="elonmusk" count={5} />`}
                </code>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-600 mb-2">
                  Updated TwitterEmbed (with API):
                </h4>
                <code className="block bg-white p-3 rounded border text-sm">
                  {`<TwitterEmbed tweetId="1790555395041472948" useApiVersion={true} />`}
                </code>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-600 mb-2">
                  Legacy TwitterEmbed:
                </h4>
                <code className="block bg-white p-3 rounded border text-sm">
                  {`<TwitterEmbed tweetId="1790555395041472948" useApiVersion={false} />`}
                </code>
              </div>
            </div>
          </section>

          {/* API Endpoints */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Available API Endpoints
            </h2>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid gap-4">
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    Get Single Tweet
                  </h4>
                  <code className="text-sm text-blue-600">
                    GET /api/twitter/tweet/[tweetId]
                  </code>
                  <p className="text-sm text-gray-600 mt-2">
                    Fetch a single tweet by ID with full metadata
                  </p>
                </div>

                <div className="bg-white p-4 rounded border">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    Get User Tweets
                  </h4>
                  <code className="text-sm text-blue-600">
                    GET /api/twitter/user/[username]?count=10
                  </code>
                  <p className="text-sm text-gray-600 mt-2">
                    Fetch recent tweets from a specific user
                  </p>
                </div>

                <div className="bg-white p-4 rounded border">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    Search Tweets
                  </h4>
                  <code className="text-sm text-blue-600">
                    GET /api/twitter/search?q=searchterm&count=10
                  </code>
                  <p className="text-sm text-gray-600 mt-2">
                    Search for tweets matching a query
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Features</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-3">
                  ✅ New API Features
                </h3>
                <ul className="text-sm text-green-700 space-y-2">
                  <li>• Rich metadata (metrics, author info, etc.)</li>
                  <li>• Media attachments support</li>
                  <li>• Proper link formatting</li>
                  <li>• Rate limiting handling</li>
                  <li>• Error handling & fallbacks</li>
                  <li>• Responsive design</li>
                  <li>• No external script dependencies</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-3">
                  🔧 Technical Benefits
                </h3>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li>• Better performance (no external widgets)</li>
                  <li>• More control over styling</li>
                  <li>• Server-side data fetching</li>
                  <li>• Consistent design with your blog</li>
                  <li>• SEO-friendly content</li>
                  <li>• Offline-friendly caching potential</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default TwitterDemo;
