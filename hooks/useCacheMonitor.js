import { useState, useEffect } from 'react';
import { getCacheStats, pruneExpiredCache } from '../services/hygraph';

/**
 * Custom hook to monitor cache usage
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoRefresh - Whether to automatically refresh stats
 * @param {number} options.refreshInterval - Refresh interval in milliseconds
 * @param {boolean} options.autoPrune - Whether to automatically prune expired cache entries
 * @param {number} options.pruneInterval - Prune interval in milliseconds
 * @returns {Object} Cache statistics and control functions
 */
const useCacheMonitor = (options = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    autoPrune = false,
    pruneInterval = 300000, // 5 minutes
  } = options;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Function to fetch cache stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      const cacheStats = getCacheStats();
      setStats(cacheStats);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching cache stats:', err);
      setError(err.message || 'Failed to fetch cache statistics');
    } finally {
      setLoading(false);
    }
  };

  // Function to prune expired cache entries
  const prune = async () => {
    try {
      const prunedCount = pruneExpiredCache();
      // Refresh stats after pruning
      fetchStats();
      return prunedCount;
    } catch (err) {
      console.error('Error pruning cache:', err);
      setError(err.message || 'Failed to prune cache');
      return 0;
    }
  };

  // Set up auto-refresh
  useEffect(() => {
    // Initial fetch
    fetchStats();

    // Set up auto-refresh interval if enabled
    let refreshTimer;
    if (autoRefresh) {
      refreshTimer = setInterval(fetchStats, refreshInterval);
    }

    // Clean up on unmount
    return () => {
      if (refreshTimer) clearInterval(refreshTimer);
    };
  }, [autoRefresh, refreshInterval]);

  // Set up auto-prune
  useEffect(() => {
    let pruneTimer;
    if (autoPrune) {
      pruneTimer = setInterval(prune, pruneInterval);
    }

    // Clean up on unmount
    return () => {
      if (pruneTimer) clearInterval(pruneTimer);
    };
  }, [autoPrune, pruneInterval]);

  return {
    stats,
    loading,
    error,
    lastUpdated,
    refresh: fetchStats,
    prune,
  };
};

export default useCacheMonitor;
