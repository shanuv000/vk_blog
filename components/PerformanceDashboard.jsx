/**
 * Production Performance Dashboard Component
 * Real-time monitoring of Hygraph API performance and optimization metrics
 */

import React, { useState, useEffect } from "react";
import { PERFORMANCE_CONFIG } from "../config/production";

const PerformanceDashboard = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/health");
        const data = await response.json();
        setHealthData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchHealthData();

    // Set up polling every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading && !healthData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading performance dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <h3 className="font-bold">Error loading dashboard</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "degraded":
        return "text-orange-600 bg-orange-100";
      case "unhealthy":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const MetricCard = ({ title, value, status, threshold, unit = "" }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          {title}
        </h3>
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
            status
          )}`}
        >
          {status}
        </span>
      </div>
      <div className="mt-2">
        <div className="text-3xl font-bold text-gray-900">
          {typeof value === "number" ? value.toFixed(2) : value}
          {unit}
        </div>
        {threshold && (
          <p className="text-sm text-gray-500 mt-1">
            Threshold: {threshold}
            {unit}
          </p>
        )}
      </div>
    </div>
  );

  const CheckItem = ({ check }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-gray-900">{check.name}</span>
      <div className="flex items-center space-x-2">
        <span className="text-gray-600">
          {check.value?.toFixed?.(1) || check.value}
        </span>
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
            check.status
          )}`}
        >
          {check.status}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Hygraph API Performance Dashboard
              </h1>
              <p className="text-gray-600">
                Real-time monitoring and optimization metrics
              </p>
            </div>
            <div className="text-right">
              <div
                className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                  healthData?.status
                )}`}
              >
                {healthData?.status?.toUpperCase()}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Last updated:{" "}
                {new Date(healthData?.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="API Success Rate"
            value={healthData?.api?.requests?.successRate || 0}
            status={healthData?.api?.status}
            threshold={95}
            unit="%"
          />
          <MetricCard
            title="Cache Hit Rate"
            value={healthData?.cache?.hitRate || 0}
            status={healthData?.cache?.status}
            threshold={60}
            unit="%"
          />
          <MetricCard
            title="Avg Response Time"
            value={healthData?.api?.performance?.averageResponseTime || 0}
            status={
              healthData?.api?.performance?.averageResponseTime >
              PERFORMANCE_CONFIG.SLOW_QUERY_THRESHOLD
                ? "warning"
                : "healthy"
            }
            threshold={PERFORMANCE_CONFIG.SLOW_QUERY_THRESHOLD}
            unit="ms"
          />
          <MetricCard
            title="Total Requests"
            value={healthData?.api?.requests?.total || 0}
            status="healthy"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* API Performance */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                API Performance
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Successful Requests</span>
                  <span className="font-medium">
                    {healthData?.api?.requests?.successful || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Failed Requests</span>
                  <span className="font-medium text-red-600">
                    {healthData?.api?.requests?.failed || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Timeout Requests</span>
                  <span className="font-medium text-orange-600">
                    {healthData?.api?.requests?.timeouts || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Slow Queries</span>
                  <span className="font-medium text-yellow-600">
                    {healthData?.api?.performance?.slowQueries || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cache Performance */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Cache Performance
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cache Hits</span>
                  <span className="font-medium text-green-600">
                    {healthData?.cache?.hits || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cache Misses</span>
                  <span className="font-medium text-red-600">
                    {healthData?.cache?.misses || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hit Rate</span>
                  <span className="font-medium">
                    {(healthData?.cache?.hitRate || 0).toFixed(1)}%
                  </span>
                </div>
                {healthData?.cache?.cacheStats && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valid Entries</span>
                      <span className="font-medium">
                        {healthData.cache.cacheStats.validEntries || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expired Entries</span>
                      <span className="font-medium text-orange-600">
                        {healthData.cache.cacheStats.expiredEntries || 0}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Health Checks */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Health Checks</h2>
          </div>
          <div className="p-6">
            {healthData?.checks?.map((check, index) => (
              <CheckItem key={index} check={check} />
            ))}
          </div>
        </div>

        {/* System Information */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              System Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Environment</p>
                <p className="font-medium">
                  {healthData?.environment?.nodeEnv}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="font-medium">{healthData?.uptime?.human}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Next.js Version</p>
                <p className="font-medium">
                  {healthData?.environment?.nextjsVersion}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium">
                  {healthData?.environment?.timestamp
                    ? new Date(
                        healthData.environment.timestamp
                      ).toLocaleTimeString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Request Deduplication */}
        {healthData?.deduplication?.stats && (
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Request Deduplication
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Requests</p>
                  <p className="font-medium">
                    {healthData.deduplication.stats.totalRequests || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Unique Requests</p>
                  <p className="font-medium">
                    {healthData.deduplication.stats.uniqueRequests || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">In Flight</p>
                  <p className="font-medium">
                    {healthData.deduplication.stats.inFlightRequests || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;
