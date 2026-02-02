import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

/**
 * Weekly Cron Job - Two tasks:
 * 1. Clean up already expired buckets (silent - no notification)
 * 2. Warn customers about points expiring within next 7 days
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
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        // ============ PART 1: Clean up already expired buckets ============
        const expiredBuckets = await prisma?.pointsBucket.findMany({
            where: {
                expiryDate: { lte: now },
                remainingPoints: { gt: 0 },
            },
            include: { customer: true },
            orderBy: { customerId: "asc" },
        });

        // Group expired buckets by customer
        const expiredByCustomer = new Map<string, { totalExpired: number; bucketIds: number[] }>();

        for (const bucket of expiredBuckets || []) {
            const existing = expiredByCustomer.get(bucket.customerId);
            if (existing) {
                existing.totalExpired += bucket.remainingPoints;
                existing.bucketIds.push(bucket.bucketId);
            } else {
                expiredByCustomer.set(bucket.customerId, {
                    totalExpired: bucket.remainingPoints,
                    bucketIds: [bucket.bucketId],
                });
            }
        }

        // Delete expired buckets and update balances
        if (expiredByCustomer.size > 0) {
            await prisma?.$transaction(async (tx: any) => {
                for (const [customerId, data] of expiredByCustomer.entries()) {
                    await tx.pointsBucket.deleteMany({
                        where: { bucketId: { in: data.bucketIds } },
                    });

                    const customer = await tx.customer.update({
                        where: { customerId },
                        data: { totalPoints: { decrement: data.totalExpired } },
                    });

                    await tx.transactionLedger.create({
                        data: {
                            customerId,
                            transactionType: "EXPIRY",
                            points: -data.totalExpired,
                            balanceAfter: customer.totalPoints,
                            description: `Weekly cleanup: ${data.bucketIds.length} bucket(s) expired`,
                        },
                    });
                }
            });
        }

        // ============ PART 2: Warn about points expiring within 7 days ============
        const expiringBuckets = await prisma?.pointsBucket.findMany({
            where: {
                expiryDate: { gt: now, lte: nextWeek },
                remainingPoints: { gt: 0 },
            },
            include: { customer: true },
            orderBy: { customerId: "asc" },
        });

        // Group expiring buckets by customer
        const expiringByCustomer = new Map<
            string,
            { name: string; phone: string; totalExpiring: number; earliestExpiry: Date }
        >();

        for (const bucket of expiringBuckets || []) {
            const existing = expiringByCustomer.get(bucket.customerId);
            if (existing) {
                existing.totalExpiring += bucket.remainingPoints;
                if (bucket.expiryDate < existing.earliestExpiry) {
                    existing.earliestExpiry = bucket.expiryDate;
                }
            } else {
                expiringByCustomer.set(bucket.customerId, {
                    name: bucket.customer.name,
                    phone: bucket.customer.phoneNumber,
                    totalExpiring: bucket.remainingPoints,
                    earliestExpiry: bucket.expiryDate,
                });
            }
        }

        // Send warning notifications in batches of 50 to avoid timeout
        let warningsSent = 0;
        let warningsFailed = 0;

        const customerEntries = Array.from(expiringByCustomer.entries());
        const BATCH_SIZE = 50;

        for (let i = 0; i < customerEntries.length; i += BATCH_SIZE) {
            const batch = customerEntries.slice(i, i + BATCH_SIZE);

            const results = await Promise.allSettled(
                batch.map(async ([customerId, data]) => {
                    const daysLeft = Math.ceil((data.earliestExpiry.getTime() - now.getTime()) / 86400000);
                    const msg = `⚠️ Points Expiring Soon!\n\n${data.totalExpiring} points will expire in ${daysLeft} day${daysLeft > 1 ? 's' : ''}.\n\nVisit us to redeem before they expire!\n\nThank you for being a valued customer.`;
                    await sendWhatsAppMessage(customerId, data.phone, "EXPIRY_WARNING", msg);
                    return customerId;
                })
            );

            for (const result of results) {
                if (result.status === 'fulfilled') {
                    warningsSent++;
                } else {
                    warningsFailed++;
                    console.error('Failed to send warning:', result.reason);
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: "Weekly cron completed successfully",
            cleanup: {
                bucketsExpired: expiredBuckets?.length || 0,
                customersAffected: expiredByCustomer.size,
            },
            warnings: {
                customersWarned: expiringByCustomer.size,
                notificationsSent: warningsSent,
                notificationsFailed: warningsFailed,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error processing weekly cron:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Weekly cron job failed",
                details: String(error),
            },
            { status: 500 }
        );
    }
}
