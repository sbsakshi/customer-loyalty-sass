import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { expirePointsForCustomer } from "@/lib/expirePoints";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { customerId, billAmount, description } = body;

        if (!customerId || !billAmount) {
            return NextResponse.json(
                { error: "Customer ID and Bill Amount are required" },
                { status: 400 }
            );
        }

        const amount = parseFloat(billAmount);
        if (isNaN(amount) || amount <= 0) {
            return NextResponse.json({ error: "Invalid bill amount" }, { status: 400 });
        }

        // Calculate Points (10% rounded down)
        const pointsEarned = Math.floor(amount * 0.10);

        if (pointsEarned === 0) {
            return NextResponse.json({
                error: "Bill amount too small to earn points (minimum ₹10)"
            }, { status: 400 });
        }

        // Calculate expiry date (6 months from now)
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 6);

        // Execute transaction
        const result = await prisma?.$transaction(async (tx: any) => {
            // STEP 1: Expire old points first (lazy expiry)
            await expirePointsForCustomer(customerId, tx);

            // STEP 2: Create bucket (working data for FIFO)
            const bucket = await tx.pointsBucket.create({
                data: {
                    customerId,
                    pointsEarned,
                    remainingPoints: pointsEarned,
                    expiryDate,
                },
            });

            // STEP 3: Update customer balance
            const customer = await tx.customer.update({
                where: { customerId },
                data: {
                    totalPoints: { increment: pointsEarned },
                },
            });

            // STEP 4: Create transaction ledger entry (permanent audit trail)
            const ledger = await tx.transactionLedger.create({
                data: {
                    customerId,
                    transactionType: "EARN",
                    points: pointsEarned,
                    balanceAfter: customer.totalPoints,
                    billAmount: amount,
                    description: description || "Purchase",
                },
            });

            return { customer, ledger, bucket };
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
            const msg = `Thank you for shopping with us!\n\nBill: ₹${amount.toFixed(2)}\nPoints earned: ${pointsEarned}\nTotal points: ${result.customer.totalPoints}\nValid till: ${expiryDate.toLocaleDateString("en-IN")}`;

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
            pointsEarned,
            expiryDate: expiryDate.toISOString(),
        });
    } catch (error) {
        console.error("Error processing earn transaction:", error);
        return NextResponse.json(
            { error: "Transaction failed", details: String(error) },
            { status: 500 }
        );
    }
}
