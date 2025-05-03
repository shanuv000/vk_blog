import { getCacheStats, pruneExpiredCache, clearCache } from '../../services/hygraph';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get action from query parameters
    const { action } = req.query;
    
    // Handle different actions
    if (action === 'prune') {
      const prunedCount = pruneExpiredCache();
      return res.status(200).json({ 
        message: `Cache pruned successfully. ${prunedCount} entries removed.`,
        stats: getCacheStats()
      });
    } else if (action === 'clear') {
      const clearedCount = clearCache();
      return res.status(200).json({ 
        message: `Cache cleared successfully. ${clearedCount} entries removed.`,
        stats: getCacheStats()
      });
    } else {
      // Default action: get stats
      const stats = getCacheStats();
      
      // Format timestamps for better readability
      const formattedStats = {
        ...stats,
        averageAge: `${Math.round(stats.averageAge / 1000)} seconds`,
        oldestEntry: `${Math.round(stats.oldestEntry / 1000)} seconds`,
        newestEntry: `${Math.round(stats.newestEntry / 1000)} seconds`,
      };
      
      return res.status(200).json({ 
        message: 'Cache statistics retrieved successfully',
        stats: formattedStats
      });
    }
  } catch (error) {
    console.error('Error handling cache stats request:', error);
    return res.status(500).json({ 
      message: 'Error retrieving cache statistics',
      error: error.message
    });
  }
}
