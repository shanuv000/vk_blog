import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for managing API loading states
 * Provides centralized loading state management with request deduplication
 */
export const useApiLoading = () => {
  const [loadingStates, setLoadingStates] = useState({});
  const [errors, setErrors] = useState({});
  const requestsRef = useRef(new Map());

  /**
   * Set loading state for a specific key
   */
  const setLoading = useCallback((key, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  }, []);

  /**
   * Set error state for a specific key
   */
  const setError = useCallback((key, error) => {
    setErrors(prev => ({
      ...prev,
      [key]: error
    }));
  }, []);

  /**
   * Clear error for a specific key
   */
  const clearError = useCallback((key) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  }, []);

  /**
   * Execute an async function with loading state management
   */
  const executeWithLoading = useCallback(async (key, asyncFn, options = {}) => {
    const { 
      deduplicate = true, 
      timeout = 30000,
      retries = 0 
    } = options;

    // Check for existing request if deduplication is enabled
    if (deduplicate && requestsRef.current.has(key)) {
      return requestsRef.current.get(key);
    }

    const executeRequest = async (attempt = 0) => {
      setLoading(key, true);
      clearError(key);

      try {
        // Set timeout for the request
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), timeout);
        });

        const result = await Promise.race([asyncFn(), timeoutPromise]);
        
        // Clear any previous errors on success
        clearError(key);
        return result;
      } catch (error) {
        console.error(`API Error for ${key}:`, error);
        
        // Retry logic
        if (attempt < retries) {
          console.log(`Retrying ${key} (attempt ${attempt + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
          return executeRequest(attempt + 1);
        }
        
        setError(key, error.message || 'An error occurred');
        throw error;
      } finally {
        setLoading(key, false);
        if (deduplicate) {
          requestsRef.current.delete(key);
        }
      }
    };

    const requestPromise = executeRequest();
    
    if (deduplicate) {
      requestsRef.current.set(key, requestPromise);
    }

    return requestPromise;
  }, [setLoading, clearError, setError]);

  /**
   * Get loading state for a specific key
   */
  const isLoading = useCallback((key) => {
    return Boolean(loadingStates[key]);
  }, [loadingStates]);

  /**
   * Get error for a specific key
   */
  const getError = useCallback((key) => {
    return errors[key] || null;
  }, [errors]);

  /**
   * Check if any requests are loading
   */
  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  /**
   * Get all loading states
   */
  const getAllLoadingStates = useCallback(() => {
    return loadingStates;
  }, [loadingStates]);

  /**
   * Clear all loading states and errors
   */
  const clearAll = useCallback(() => {
    setLoadingStates({});
    setErrors({});
    requestsRef.current.clear();
  }, []);

  return {
    // State getters
    isLoading,
    getError,
    isAnyLoading,
    getAllLoadingStates,
    
    // Actions
    executeWithLoading,
    setLoading,
    setError,
    clearError,
    clearAll,
    
    // Raw states (for debugging)
    loadingStates,
    errors
  };
};

/**
 * Hook for managing pagination API loading states
 */
export const usePaginationLoading = () => {
  const apiLoading = useApiLoading();

  const loadInitialPosts = useCallback(async (fetchFn, options = {}) => {
    return apiLoading.executeWithLoading('initial-posts', fetchFn, {
      timeout: 15000,
      retries: 2,
      ...options
    });
  }, [apiLoading]);

  const loadMorePosts = useCallback(async (fetchFn, options = {}) => {
    return apiLoading.executeWithLoading('load-more-posts', fetchFn, {
      timeout: 10000,
      retries: 1,
      ...options
    });
  }, [apiLoading]);

  const loadCategoryPosts = useCallback(async (categorySlug, fetchFn, options = {}) => {
    return apiLoading.executeWithLoading(`category-${categorySlug}`, fetchFn, {
      timeout: 15000,
      retries: 2,
      ...options
    });
  }, [apiLoading]);

  return {
    ...apiLoading,
    loadInitialPosts,
    loadMorePosts,
    loadCategoryPosts,
    
    // Specific state getters
    isLoadingInitial: () => apiLoading.isLoading('initial-posts'),
    isLoadingMore: () => apiLoading.isLoading('load-more-posts'),
    isLoadingCategory: (slug) => apiLoading.isLoading(`category-${slug}`),
    
    // Specific error getters
    getInitialError: () => apiLoading.getError('initial-posts'),
    getLoadMoreError: () => apiLoading.getError('load-more-posts'),
    getCategoryError: (slug) => apiLoading.getError(`category-${slug}`)
  };
};

export default useApiLoading;
