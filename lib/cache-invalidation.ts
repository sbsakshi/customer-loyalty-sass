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

/**
 * Invalidate frequent customers cache after new bill
 */
export async function invalidateFrequentCustomers() {
  await invalidateCache('customers:frequent')
}

/**
 * Invalidate all transaction-related caches
 */
export async function invalidateTransactionCaches() {
  await invalidateCache(
    'stats:global:reports',
    'stats:dashboard:main',
    'customers:frequent'
  )
}
