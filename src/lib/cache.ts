// Simple in-memory cache for API responses
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export function getCachedData(key: string): any | null {
  const item = cache.get(key);
  if (!item) return null;
  
  if (Date.now() > item.timestamp + item.ttl) {
    cache.delete(key);
    return null;
  }
  
  return item.data;
}

export function setCachedData(key: string, data: any, ttlMs: number = 5 * 60 * 1000): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs
  });
}

export function clearCache(pattern?: string): void {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
}

// Cache middleware for API routes
export function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 5 * 60 * 1000
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      const cached = getCachedData(key);
      if (cached) {
        resolve(cached);
        return;
      }
      
      const data = await fetcher();
      setCachedData(key, data, ttlMs);
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
}
