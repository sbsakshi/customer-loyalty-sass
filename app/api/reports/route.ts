import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCached } from "@/lib/cache-helpers";
import { TTL } from "@/lib/redis-ttl";

export async function GET(req: NextRequest) {
    try {
        // Check if Redis is enabled
        const cacheEnabled = process.env.REDIS_ENABLED === 'true'

        if (!cacheEnabled) {
            // Fallback to direct DB query if Redis disabled
            const stats = await getReportsFromDB()
            return NextResponse.json(stats)
        }

        // Cache-aside pattern: check cache first, fallback to DB
        const stats = await getCached(
            'stats:global:reports',
            TTL.STATS_GLOBAL,
            async () => await getReportsFromDB()
        )

        return NextResponse.json(stats)
    } catch (error) {
        console.error("Error fetching report:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

// Extract DB query logic for reuse
async function getReportsFromDB() {
    // Run queries in parallel for better performance
    const [
        totalCustomers,
        totalTransactions,
        totalPointsIssuedAgg,
        totalRedeemedAgg,
        totalExpiredAgg,
        activeBucketsCount
    ] = await Promise.all([
        prisma?.customer.count(),
        prisma?.transactionLedger.count(),
        prisma?.transactionLedger.aggregate({
            where: { transactionType: "EARN" },
            _sum: { points: true }
        }),
        prisma?.transactionLedger.aggregate({
            where: { transactionType: "REDEEM" },
            _sum: { points: true }
        }),
        prisma?.transactionLedger.aggregate({
            where: { transactionType: "EXPIRY" },
            _sum: { points: true }
        }),
        prisma?.pointsBucket.count()
    ])

    return {
        totalCustomers,
        totalTransactions,
        totalPointsIssued: totalPointsIssuedAgg?._sum.points || 0,
        totalPointsRedeemed: Math.abs(totalRedeemedAgg?._sum.points || 0),
        totalPointsExpired: Math.abs(totalExpiredAgg?._sum.points || 0),
        activeBucketsCount
    }
}
