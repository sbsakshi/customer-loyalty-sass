import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

/**
 * Daily Report Cron Job
 *
 * This endpoint runs at 11:00 PM IST (17:30 UTC) to calculate and store
 * daily statistics and send summary to admin.
 */
export async function GET(req: NextRequest) {
    // Verify the request is from Vercel Cron
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        // Calculate for today (IST timezone consideration)
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setUTCHours(0, 0, 0, 0);

        const todayEnd = new Date(now);
        todayEnd.setUTCHours(23, 59, 59, 999);

        // Run all queries in parallel for performance
        const [
            newCustomers,
            totalCustomers,
            earnTransactions,
            redeemTransactions,
            expiryTransactions,
        ] = await Promise.all([
            // New customers registered today
            prisma?.customer.count({
                where: {
                    createdAt: {
                        gte: todayStart,
                        lte: todayEnd,
                    },
                },
            }),

            // Total customers
            prisma?.customer.count(),

            // Points earned today
            prisma?.transactionLedger.aggregate({
                where: {
                    transactionType: "EARN",
                    createdAt: {
                        gte: todayStart,
                        lte: todayEnd,
                    },
                },
                _sum: {
                    points: true,
                    billAmount: true,
                },
                _count: true,
            }),

            // Points redeemed today
            prisma?.transactionLedger.aggregate({
                where: {
                    transactionType: "REDEEM",
                    createdAt: {
                        gte: todayStart,
                        lte: todayEnd,
                    },
                },
                _sum: {
                    points: true,
                },
                _count: true,
            }),

            // Points expired today
            prisma?.transactionLedger.aggregate({
                where: {
                    transactionType: "EXPIRY",
                    createdAt: {
                        gte: todayStart,
                        lte: todayEnd,
                    },
                },
                _sum: {
                    points: true,
                },
                _count: true,
            }),
        ]);

        const pointsEarned = earnTransactions?._sum?.points || 0;
        const pointsRedeemed = Math.abs(redeemTransactions?._sum?.points || 0);
        const pointsExpired = Math.abs(expiryTransactions?._sum?.points || 0);
        const transactionCount =
            (earnTransactions?._count || 0) +
            (redeemTransactions?._count || 0) +
            (expiryTransactions?._count || 0);
        const totalBillAmount = earnTransactions?._sum?.billAmount || 0;

        // Upsert the daily report (update if already exists for today)
        const report = await prisma?.dailyReport.upsert({
            where: {
                reportDate: todayStart,
            },
            update: {
                newCustomers: newCustomers || 0,
                totalCustomers: totalCustomers || 0,
                pointsEarned,
                pointsRedeemed,
                pointsExpired,
                transactionCount,
                totalBillAmount,
            },
            create: {
                reportDate: todayStart,
                newCustomers: newCustomers || 0,
                totalCustomers: totalCustomers || 0,
                pointsEarned,
                pointsRedeemed,
                pointsExpired,
                transactionCount,
                totalBillAmount,
            },
        });

        // Send daily summary to admin
        let adminNotified = false;
        const adminPhone = process.env.ADMIN_PHONE;

        if (adminPhone) {
            const dateStr = todayStart.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
            });

            const msg = `📊 Daily Report - ${dateStr}\n\n` +
                `👥 New Customers: ${newCustomers || 0}\n` +
                `👥 Total Customers: ${totalCustomers || 0}\n\n` +
                `💰 Revenue: ₹${Number(totalBillAmount).toFixed(0)}\n` +
                `📈 Transactions: ${transactionCount}\n\n` +
                `✨ Points Earned: ${pointsEarned}\n` +
                `🎁 Points Redeemed: ${pointsRedeemed}\n` +
                `⏰ Points Expired: ${pointsExpired}`;

            try {
                await sendWhatsAppMessage("ADMIN", adminPhone, "DAILY_REPORT", msg);
                adminNotified = true;
            } catch (e) {
                console.error("Failed to send daily report to admin:", e);
            }
        }

        return NextResponse.json({
            success: true,
            message: "Daily report generated successfully",
            adminNotified,
            report: {
                date: todayStart.toISOString().split("T")[0],
                newCustomers: newCustomers || 0,
                totalCustomers: totalCustomers || 0,
                pointsEarned,
                pointsRedeemed,
                pointsExpired,
                transactionCount,
                totalBillAmount: Number(totalBillAmount),
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error generating daily report:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Daily report generation failed",
                details: String(error),
            },
            { status: 500 }
        );
    }
}
