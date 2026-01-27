import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { expirePointsForCustomer } from "@/lib/expirePoints";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { customerId, pointsToRedeem, description } = body;

        if (!customerId || !pointsToRedeem) {
            return NextResponse.json(
                { error: "Customer ID and Points to Redeem are required" },
                { status: 400 }
            );
        }

        const points = parseInt(pointsToRedeem);
        if (isNaN(points) || points <= 0) {
            return NextResponse.json({ error: "Invalid points amount" }, { status: 400 });
        }

        // Execute transaction with FIFO logic
        const result = await prisma?.$transaction(async (tx: any) => {
            // STEP 1: Expire old points first (lazy expiry)
            await expirePointsForCustomer(customerId, tx);

            // STEP 2: Check balance after expiry
            const customer = await tx.customer.findUnique({
                where: { customerId },
            });

            if (!customer) {
                throw new Error("Customer not found");
            }

            if (customer.totalPoints < points) {
                throw new Error("Insufficient points balance");
            }

            // STEP 3: FIFO consumption from oldest buckets
            let pointsRemaining = points;

            const availableBuckets = await tx.pointsBucket.findMany({
                where: {
                    customerId,
                    remainingPoints: { gt: 0 },
                },
                orderBy: { expiryDate: "asc" }, // Oldest first (FIFO)
            });

            const bucketsConsumed: Array<{
                bucketId: number;
                consumed: number;
                expiryDate: Date;
            }> = [];

            for (const bucket of availableBuckets) {
                if (pointsRemaining <= 0) break;

                const toConsume = Math.min(pointsRemaining, bucket.remainingPoints);
                const newRemaining = bucket.remainingPoints - toConsume;

                if (newRemaining === 0) {
                    // Bucket fully consumed - DELETE it
                    await tx.pointsBucket.delete({
                        where: { bucketId: bucket.bucketId },
                    });
                } else {
                    // Partial consumption - UPDATE it
                    await tx.pointsBucket.update({
                        where: { bucketId: bucket.bucketId },
                        data: { remainingPoints: newRemaining },
                    });
                }

                bucketsConsumed.push({
                    bucketId: bucket.bucketId,
                    consumed: toConsume,
                    expiryDate: bucket.expiryDate,
                });

                pointsRemaining -= toConsume;
            }

            // Safety check
            if (pointsRemaining > 0) {
                throw new Error("FIFO consumption failed - insufficient buckets");
            }

            // STEP 4: Update customer balance
            const updatedCustomer = await tx.customer.update({
                where: { customerId },
                data: {
                    totalPoints: { decrement: points },
                },
            });

            // STEP 5: Create transaction ledger entry (permanent audit trail)
            const ledger = await tx.transactionLedger.create({
                data: {
                    customerId,
                    transactionType: "REDEEM",
                    points: -points,
                    balanceAfter: updatedCustomer.totalPoints,
                    description: description || "Redemption",
                },
            });

            return {
                customer: updatedCustomer,
                ledger,
                bucketsConsumed,
            };
        });

        // Invalidate cached stats (fire-and-forget)
        import('@/lib/cache-invalidation').then(({ invalidateGlobalStats }) =>
            invalidateGlobalStats().catch(err =>
                console.error('Cache invalidation failed:', err)
            )
        )

        // Send WhatsApp Notification
        if (result.customer) {
            const { sendWhatsAppMessage } = await import("@/lib/whatsapp");
            const msg = `Points Redeemed Successfully!\n\nRedeemed: ${points} points\nRemaining Balance: ${result.customer.totalPoints}\nEnjoy your reward!`;

            try {
                await sendWhatsAppMessage(
                    result.customer.customerId,
                    result.customer.phoneNumber,
                    "TXN",
                    msg
                );
            } catch (e) {
                console.error("Failed to send WhatsApp notification:", e);
            }
        }

        return NextResponse.json({
            success: true,
            customer: result.customer,
            pointsRedeemed: points,
            bucketsConsumed: result.bucketsConsumed.length,
        });
    } catch (error: any) {
        console.error("Error processing redemption:", error);
        return NextResponse.json(
            { error: error.message || "Transaction failed" },
            { status: error.message === "Insufficient points balance" || error.message === "Customer not found" ? 400 : 500 }
        );
    }
}
