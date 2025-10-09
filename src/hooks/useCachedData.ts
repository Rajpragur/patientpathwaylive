import { useState, useEffect, useCallback } from 'react';

interface CachedItem<T> {
  data: T;
  timestamp: number;
  version: string; // For cache invalidation when structure changes
}

const CACHE_VERSION = '1.0';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Custom hook for caching data in localStorage with 24-hour expiration
 * @param key - Unique key for the cached data
 * @param fetchFunction - Async function to fetch fresh data when cache is invalid
 * @param dependencies - Dependencies that trigger refetch
 */
export function useCachedData<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCacheKey = useCallback((baseKey: string) => {
    return `cached_${baseKey}`;
  }, []);

  const getCachedData = useCallback((cacheKey: string): T | null => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const cachedItem: CachedItem<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired or version mismatch
      if (
        cachedItem.version !== CACHE_VERSION ||
        now - cachedItem.timestamp > CACHE_DURATION
      ) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return cachedItem.data;
    } catch (err) {
      console.warn(`Error reading cache for ${cacheKey}:`, err);
      return null;
    }
  }, []);

  const setCachedData = useCallback((cacheKey: string, newData: T) => {
    try {
      const cachedItem: CachedItem<T> = {
        data: newData,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      };
      localStorage.setItem(cacheKey, JSON.stringify(cachedItem));
    } catch (err) {
      console.warn(`Error setting cache for ${cacheKey}:`, err);
      // If localStorage is full, clear old cache entries
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        clearExpiredCache();
        try {
          const cachedItem: CachedItem<T> = {
            data: newData,
            timestamp: Date.now(),
            version: CACHE_VERSION,
          };
          localStorage.setItem(cacheKey, JSON.stringify(cachedItem));
        } catch (retryErr) {
          console.error('Failed to cache data even after cleanup:', retryErr);
        }
      }
    }
  }, []);

  const clearExpiredCache = useCallback(() => {
    try {
      const now = Date.now();
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cached_')) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const cachedItem: CachedItem<any> = JSON.parse(item);
              if (now - cachedItem.timestamp > CACHE_DURATION) {
                keysToRemove.push(key);
              }
            }
          } catch (e) {
            // If we can't parse it, mark it for removal
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`Cleared ${keysToRemove.length} expired cache entries`);
    } catch (err) {
      console.warn('Error clearing expired cache:', err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    const cacheKey = getCacheKey(key);
    
    // Try to get cached data first
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    // If no cache, fetch fresh data
    setLoading(true);
    setError(null);

    try {
      const freshData = await fetchFunction();
      setData(freshData);
      setCachedData(cacheKey, freshData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [key, fetchFunction, getCacheKey, getCachedData, setCachedData]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  const refetch = useCallback(() => {
    // Clear cache and refetch
    const cacheKey = getCacheKey(key);
    localStorage.removeItem(cacheKey);
    fetchData();
  }, [key, getCacheKey, fetchData]);

  const clearCache = useCallback(() => {
    const cacheKey = getCacheKey(key);
    localStorage.removeItem(cacheKey);
  }, [key, getCacheKey]);

  return { data, loading, error, refetch, clearCache };
}

/**
 * Clear all cached data for a specific doctor
 */
export function clearDoctorCache(doctorId: string) {
  const keysToRemove = [
    `cached_doctor_profile_${doctorId}`,
    `cached_chatbot_colors_NOSE_${doctorId}`,
    `cached_chatbot_colors_SNOT12_${doctorId}`,
    `cached_ai_content_NOSE_${doctorId}`,
    `cached_ai_content_SNOT12_${doctorId}`,
  ];

  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn(`Error removing cache key ${key}:`, err);
    }
  });
}

/**
 * Clear all expired cache entries across the entire app
 */
export function clearAllExpiredCache() {
  try {
    const now = Date.now();
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cached_')) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const cachedItem: CachedItem<any> = JSON.parse(item);
            if (now - cachedItem.timestamp > CACHE_DURATION) {
              keysToRemove.push(key);
            }
          }
        } catch (e) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${keysToRemove.length} expired cache entries`);
  } catch (err) {
    console.warn('Error clearing all expired cache:', err);
  }
}

