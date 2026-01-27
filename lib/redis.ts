import { Redis } from '@upstash/redis'

// Upstash Redis client - serverless-friendly HTTP-based REST API
export const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export default kv
