import React, { useState } from "react";
import Head from "next/head";
import * as Sentry from "@sentry/nextjs";

export default function SentryExamplePage() {
  const [message, setMessage] = useState("");

  // Test 1: Throw a simple error
  const throwError = () => {
    setMessage("Throwing error...");
    throw new Error("Sentry Test Error: This is a deliberate test error!");
  };

  // Test 2: Call undefined function
  const callUndefinedFunction = () => {
    setMessage("Calling undefined function...");
    myUndefinedFunction(); // This will cause an error
  };

  // Test 3: Capture exception manually
  const captureException = () => {
    setMessage("Capturing exception manually...");
    try {
      throw new Error("Manually captured error for testing");
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          test: "manual-capture",
          page: "sentry-example",
        },
        extra: {
          testType: "manual",
          timestamp: new Date().toISOString(),
        },
      });
      setMessage("✅ Exception captured and sent to Sentry!");
    }
  };

  // Test 4: Capture message
  const captureMessage = () => {
    setMessage("Capturing message...");
    Sentry.captureMessage("Test message from Sentry example page", {
      level: "info",
      tags: {
        test: "message-capture",
      },
    });
    setMessage("✅ Message sent to Sentry!");
  };

  // Test 5: Async error
  const throwAsyncError = async () => {
    setMessage("Throwing async error...");
    await new Promise((resolve) => setTimeout(resolve, 100));
    throw new Error("Sentry Async Test Error: This is a deliberate async error!");
  };

  // Test 6: Promise rejection
  const rejectPromise = () => {
    setMessage("Creating unhandled promise rejection...");
    Promise.reject(new Error("Unhandled Promise Rejection Test"));
  };

  return (
    <>
      <Head>
        <title>Sentry Test Page | urTechy Blog</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              🚨 Sentry Test Page
            </h1>
            <p className="text-gray-300 text-lg">
              Test Sentry error tracking integration
            </p>
            <div className="mt-4 p-4 bg-yellow-900/50 border border-yellow-600 rounded-lg inline-block">
              <p className="text-yellow-200 text-sm">
                ⚠️ <strong>Note:</strong> In development mode, errors are logged to console only.
                <br />
                Deploy to production or set NEXT_PUBLIC_SENTRY_ENVIRONMENT=production to send to Sentry.
              </p>
            </div>
          </div>

          {/* Status Message */}
          {message && (
            <div className="mb-8 p-4 bg-blue-900/50 border border-blue-600 rounded-lg">
              <p className="text-blue-200">{message}</p>
            </div>
          )}

          {/* Test Buttons Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Test 1 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                Test 1: Throw Error
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Throws a simple JavaScript error
              </p>
              <button
                onClick={throwError}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Throw Error
              </button>
            </div>

            {/* Test 2 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                Test 2: Undefined Function
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Calls a function that doesn't exist
              </p>
              <button
                onClick={callUndefinedFunction}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Call Undefined Function
              </button>
            </div>

            {/* Test 3 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                Test 3: Manual Capture
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Manually captures an exception with context
              </p>
              <button
                onClick={captureException}
                className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
              >
                Capture Exception
              </button>
            </div>

            {/* Test 4 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                Test 4: Capture Message
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Sends an info message to Sentry
              </p>
              <button
                onClick={captureMessage}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Send Message
              </button>
            </div>

            {/* Test 5 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                Test 5: Async Error
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Throws an error in async function
              </p>
              <button
                onClick={throwAsyncError}
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Throw Async Error
              </button>
            </div>

            {/* Test 6 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                Test 6: Promise Rejection
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Creates an unhandled promise rejection
              </p>
              <button
                onClick={rejectPromise}
                className="w-full px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors"
              >
                Reject Promise
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-12 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              📋 Instructions
            </h2>
            <ol className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="font-bold text-purple-400 mr-3">1.</span>
                <span>
                  Click any test button above to trigger different types of errors
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-purple-400 mr-3">2.</span>
                <span>
                  In <strong>development</strong>: Check your browser console to see Sentry events
                  (they won't be sent to Sentry.io)
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-purple-400 mr-3">3.</span>
                <span>
                  In <strong>production</strong>: Visit{" "}
                  <a
                    href="https://sentry.io/organizations/urtechy-r0/issues/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Sentry Dashboard
                  </a>{" "}
                  after 1-2 minutes
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-purple-400 mr-3">4.</span>
                <span>
                  Look for issues tagged with "sentry-example" or "test"
                </span>
              </li>
            </ol>
          </div>

          {/* Links */}
          <div className="mt-8 text-center space-x-4">
            <a
              href="/"
              className="inline-block px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              ← Back to Home
            </a>
            <a
              href="https://sentry.io/organizations/urtechy-r0/projects/urtechy-blog/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Open Sentry Dashboard →
            </a>
          </div>

          {/* Environment Info */}
          <div className="mt-8 p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Environment Info</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Mode:</span>{" "}
                <span className="text-white font-mono">
                  {process.env.NODE_ENV}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Sentry Environment:</span>{" "}
                <span className="text-white font-mono">
                  {process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "not set"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
