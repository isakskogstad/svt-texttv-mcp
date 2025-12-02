/**
 * In-memory cache with TTL for Text-TV data
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Simple in-memory cache with TTL support
 */
export class Cache {
  private store = new Map<string, CacheEntry<unknown>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(cleanupIntervalMs: number = 60_000) {
    // Periodic cleanup of expired entries
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, cleanupIntervalMs);

    // Allow process to exit
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Set a value in cache with TTL
   */
  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.store.get(key);

    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.store.size;
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

/**
 * Generate cache key for page requests
 */
export function pageKey(pageNum: number, includePlainText: boolean = false): string {
  return `page:${pageNum}:${includePlainText ? 'plain' : 'html'}`;
}

/**
 * Generate cache key for page range requests
 */
export function pageRangeKey(start: number, end: number, includePlainText: boolean = false): string {
  return `range:${start}-${end}:${includePlainText ? 'plain' : 'html'}`;
}

/**
 * Generate cache key for search requests
 */
export function searchKey(query: string, startPage: number, endPage: number): string {
  return `search:${query}:${startPage}-${endPage}`;
}

/**
 * Generate cache key for category browse
 */
export function categoryKey(category: string, includeContent: boolean = false): string {
  return `category:${category}:${includeContent ? 'content' : 'meta'}`;
}

// Singleton cache instance
export const cache = new Cache();
