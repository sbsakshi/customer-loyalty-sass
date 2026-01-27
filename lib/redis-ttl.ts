export const TTL = {
  // High-frequency reads, acceptable staleness
  STATS_GLOBAL: 300,              // 5 minutes
  DASHBOARD_METRICS: 180,         // 3 minutes
} as const
