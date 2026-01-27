import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

/**
 * Weekly Cleanup Cron Job
 *
 * This endpoint should be called weekly (e.g., every Sunday at midnight).
 * It processes ALL expired buckets globally and sends WhatsApp notifications.
 *
 * Note: Daily user interactions already handle lazy expiry, so this is mainly
 * for cleanup and ensuring customers get notified about expirations.
 */
export async function GET(req: NextRequest) {
    try {
        const now = new Date();

        // Find all expired buckets across all customers
        const expiredBuckets = await prisma?.pointsBucket.findMany({
            where: {
                expiryDate: { lte: now },
                remainingPoints: { gt: 0 },
            },
            include: {
                customer: true, // Include customer for phone number
            },
            orderBy: { customerId: "asc" },
        });

        if (!expiredBuckets || expiredBuckets.length === 0) {
            return NextResponse.json({
                success: true,
                message: "No expired buckets to process",
                bucketsExpired: 0,
                customersAffected: 0,
            });
        }

        // Group expired buckets by customer
        const customerExpiryMap = new Map<
            string,
            {
                name: string;
                phone: string;
                totalExpired: number;
                bucketIds: number[];
            }
        >();

        for (const bucket of expiredBuckets) {
            const existing = customerExpiryMap.get(bucket.customerId);

            if (existing) {
                existing.totalExpired += bucket.remainingPoints;
                existing.bucketIds.push(bucket.bucketId);
            } else {
                customerExpiryMap.set(bucket.customerId, {
                    name: bucket.customer.name,
                    phone: bucket.customer.phoneNumber,
                    totalExpired: bucket.remainingPoints,
                    bucketIds: [bucket.bucketId],
                });
            }
        }

        // Execute database updates in transaction
        await prisma?.$transaction(async (tx: any) => {
            for (const [customerId, data] of customerExpiryMap.entries()) {
                // 1. Delete expired buckets
                await tx.pointsBucket.deleteMany({
                    where: {
                        bucketId: { in: data.bucketIds },
                    },
                });

                // 2. Update customer balance
                const customer = await tx.customer.update({
                    where: { customerId },
                    data: { totalPoints: { decrement: data.totalExpired } },
                });

                // 3. Create transaction ledger entry (permanent audit trail)
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

        // Send WhatsApp notifications (outside transaction to avoid blocking)
        let notificationsSent = 0;
        let notificationsFailed = 0;

        for (const [customerId, data] of customerExpiryMap.entries()) {
            const msg = `⚠️ Points Expiry Alert\n\n${data.totalExpired} points have expired as per our 6-month validity policy.\n\nPlease check your updated balance.\n\nThank you for being a valued customer!`;

            try {
                await sendWhatsAppMessage(customerId, data.phone, "EXPIRY", msg);
                notificationsSent++;
            } catch (e) {
                console.error(`Failed to send notification to ${customerId}:`, e);
                notificationsFailed++;
            }
        }

        return NextResponse.json({
            success: true,
            message: "Weekly expiry cleanup completed successfully",
            bucketsExpired: expiredBuckets.length,
            customersAffected: customerExpiryMap.size,
            notificationsSent,
            notificationsFailed,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error processing weekly expiry cleanup:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Expiry cleanup job failed",
                details: String(error),
            },
            { status: 500 }
        );
    }
}
