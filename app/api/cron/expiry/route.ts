import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

// This endpoint to be called by Cron
export async function GET(req: NextRequest) {
    try {
        const today = new Date();

        // Find all EARN batches that are expired as of today and have remaining points
        const expiredBatches = await prisma?.pointsLedger.findMany({
            where: {
                transactionType: "EARN",
                expiryDate: { lte: today },
                remainingPoints: { gt: 0 },
            },
            include: {
                customer: true // Include customer to get phone number
            }
        });

        if (!expiredBatches || expiredBatches.length === 0) {
            return NextResponse.json({ message: "No points to expire" });
        }

        const customerExpiryMap = new Map<string, { amount: number, phone: string, name: string }>();

        // updates array for ledger logic
        const updates: any[] = [];

        for (const batch of expiredBatches) {
            const amount = batch.remainingPoints;
            const customerId = batch.customerId;

            // 1. Mark batch as consumed
            updates.push(
                prisma?.pointsLedger.update({
                    where: { ledgerId: batch.ledgerId },
                    data: { remainingPoints: 0 }
                })
            );

            // Accumulate data
            const current = customerExpiryMap.get(customerId) || { amount: 0, phone: batch.customer.phoneNumber, name: batch.customer.name };
            customerExpiryMap.set(customerId, {
                amount: current.amount + amount,
                phone: batch.customer.phoneNumber,
                name: batch.customer.name
            });
        }

        // Execute DB updates based on accumulated data
        await prisma?.$transaction(async (tx: any) => {
            await Promise.all(updates);

            for (const [customerId, data] of customerExpiryMap.entries()) {
                // Deduct from customer
                const customer = await tx.customer.update({
                    where: { customerId },
                    data: { totalPoints: { decrement: data.amount } }
                });

                // Ledger entry
                await tx.pointsLedger.create({
                    data: {
                        customerId,
                        transactionType: "EXPIRY",
                        points: -data.amount,
                        balanceAfter: customer.totalPoints,
                        description: "Points Expired",
                        remainingPoints: 0
                    }
                });
            }
        });

        // Send WhatsApp Notifications (Outside transaction to avoid slow API blocking DB)
        let sentCount = 0;
        for (const [customerId, data] of customerExpiryMap.entries()) {
            const msg = `Alert: ${data.amount} points have expired today as per the 6-month validity policy.\nCurrent Balance: ${data.amount} less.`;
            // In a real job, we might queue this.
            await sendWhatsAppMessage(customerId, data.phone, "EXPIRY", msg);
            sentCount++;
        }

        return NextResponse.json({
            message: `Processed expiry for ${expiredBatches.length} batches. Sent ${sentCount} notifications.`
        });

    } catch (error) {
        console.error("Error processing expiry:", error);
        return NextResponse.json(
            { error: "Expiry job failed" },
            { status: 500 }
        );
    }
}
