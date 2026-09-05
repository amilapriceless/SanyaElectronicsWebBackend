class MemoryCache {
  constructor(maxEntries = 1000) {
    this.cache = new Map();
    this.maxEntries = maxEntries;
  }

  /**
   * Get a cached entry by key.
   * Returns null if key is missing or expired.
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Set a cached entry with TTL in seconds (default 5 minutes).
   */
  set(key, value, ttlSeconds = 300) {
    this.removeExpired();

    if (!this.cache.has(key) && this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    const expiry = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiry });
  }

  removeExpired() {
    const now = Date.now();
    for (const [key, item] of this.cache) {
      if (now > item.expiry) this.cache.delete(key);
    }
  }

  /**
   * Delete a specific key.
   */
  del(key) {
    this.cache.delete(key);
  }

  /**
   * Invalidate all keys matching a prefix (e.g. "products:").
   */
  invalidatePrefix(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear entire cache.
   */
  flush() {
    this.cache.clear();
  }
}

const cache = new MemoryCache();
export default cache;
