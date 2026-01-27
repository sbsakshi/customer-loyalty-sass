import { getCached } from "./cache-helpers";
import { TTL } from "./redis-ttl";
import prisma from "./prisma";

export async function getDashboardStats() {
    const cacheEnabled = process.env.REDIS_ENABLED === 'true'

    if (!cacheEnabled) {
        return getDashboardStatsFromDB()
    }

    return getCached(
        'stats:dashboard:main',
        TTL.DASHBOARD_METRICS,
        async () => await getDashboardStatsFromDB()
    )
}

async function getDashboardStatsFromDB() {
    const [customerCount, transactionLedgerSum] = await Promise.all([
        prisma.customer.count(),
        prisma.transactionLedger.aggregate({
            _sum: { points: true },
            where: { transactionType: "EARN" }
        })
    ])

    return {
        customerCount,
        pointsDistributed: transactionLedgerSum._sum.points || 0
    }
}
