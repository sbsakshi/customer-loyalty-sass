import { invalidateCache } from './cache-helpers'

/**
 * Invalidate global stats after any transaction
 */
export async function invalidateGlobalStats() {
  await invalidateCache(
    'stats:global:reports',
    'stats:dashboard:main'
  )
}
