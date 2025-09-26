/**
 * Performance Dashboard Page
 * Production monitoring interface for Hygraph API optimization
 */

import Head from "next/head";
import { useState, useEffect } from "react";
import PerformanceDashboard from "../components/PerformanceDashboard";

export default function DashboardPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple authorization check
    // In production, implement proper authentication
    const checkAuth = () => {
      if (process.env.NODE_ENV === "development") {
        setIsAuthorized(true);
      } else {
        // Check for admin access token or implement your auth logic
        const adminKey =
          localStorage.getItem("admin_key") ||
          sessionStorage.getItem("admin_key") ||
          new URLSearchParams(window.location.search).get("key");

        if (adminKey === process.env.NEXT_PUBLIC_DASHBOARD_KEY) {
          setIsAuthorized(true);
          sessionStorage.setItem("admin_key", adminKey);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <>
        <Head>
          <title>Access Required - Performance Dashboard</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Dashboard Access Required
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Enter your admin key to access the performance dashboard
              </p>
            </div>
            <AdminKeyForm onSuccess={() => setIsAuthorized(true)} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Hygraph API Performance Dashboard</title>
        <meta
          name="description"
          content="Real-time monitoring of Hygraph API performance and optimization metrics"
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <PerformanceDashboard />
    </>
  );
}

// Simple admin key form component
function AdminKeyForm({ onSuccess }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate key (in production, validate against your backend)
      if (key === process.env.NEXT_PUBLIC_DASHBOARD_KEY) {
        sessionStorage.setItem("admin_key", key);
        onSuccess();
      } else {
        setError("Invalid access key");
      }
    } catch (err) {
      setError("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="admin-key" className="sr-only">
          Admin Key
        </label>
        <input
          id="admin-key"
          name="key"
          type="password"
          required
          className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
          placeholder="Admin access key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Access Dashboard"}
        </button>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Development mode: Dashboard access is enabled
          </p>
        </div>
      )}
    </form>
  );
}
