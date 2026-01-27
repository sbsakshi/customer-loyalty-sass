import kv from './redis'

/**
 * Cache-aside pattern with automatic fallback
 * Returns cached data if available, otherwise fetches from DB and caches
 */
export async function getCached<T>(
  key: string,
  ttl: number,
  fallback: () => Promise<T>
): Promise<T> {
  try {
    // Try cache first
    const cached = await kv.get<T>(key)
    if (cached !== null) {
      if (process.env.REDIS_DEBUG === 'true') {
        console.log('[Cache HIT]', key)
      }
      return cached
    }

    if (process.env.REDIS_DEBUG === 'true') {
      console.log('[Cache MISS]', key)
    }
  } catch (err) {
    console.error('Redis get failed:', err)
  }

  // Cache miss or error - fetch from DB
  const fresh = await fallback()

  // Store in cache (fire-and-forget, don't block response)
  kv.set(key, fresh, { ex: ttl }).catch(err =>
    console.error('Redis set failed:', err)
  )

  return fresh
}

/**
 * Invalidate cache keys
 */
export async function invalidateCache(...keys: string[]) {
  try {
    if (keys.length > 0) {
      await kv.unlink(...keys)
    }
  } catch (err) {
    console.error('Cache invalidation failed:', err)
  }
}
