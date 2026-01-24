import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        // Basic Stats Implementation
        const totalCustomers = await prisma?.customer.count();
        const totalTransactions = await prisma?.pointsLedger.count();

        // Sum total points issued (EARN)
        const totalPointsIssuedAgg = await prisma?.pointsLedger.aggregate({
            where: { transactionType: "EARN" },
            _sum: { points: true }
        });

        // Sum total points redeemed
        const totalRedeemedAgg = await prisma?.pointsLedger.aggregate({
            where: { transactionType: "REDEEM" },
            _sum: { points: true }
        });

        return NextResponse.json({
            totalCustomers,
            totalTransactions,
            totalPointsIssued: totalPointsIssuedAgg?._sum.points || 0,
            totalPointsRedeemed: Math.abs(totalRedeemedAgg?._sum.points || 0)
        });
    } catch (error) {
        console.error("Error fetching report:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
