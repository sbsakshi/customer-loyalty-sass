import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

        // 1. Calculate Points (10% rounded down)
        const pointsEarned = Math.floor(amount * 0.10);

        // 2. Transaction
        // We need to update Customer Total AND Create Ledger Entry
        // Prisma transaction ensures atomicity
        const result = await prisma?.$transaction(async (tx: any) => {
            // Create Ledger
            const ledger = await tx.pointsLedger.create({
                data: {
                    customerId,
                    transactionType: "EARN",
                    points: pointsEarned,
                    balanceAfter: 0, // Placeholder, will update
                    billAmount: amount,
                    description: description || "Purchase",
                    remainingPoints: pointsEarned, // For FIFO
                    expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 6)), // 6 months later
                },
            });

            // Update Customer
            const customer = await tx.customer.update({
                where: { customerId },
                data: {
                    totalPoints: { increment: pointsEarned },
                },
            });

            // Update Ledger BalanceAfter
            // Note: In a high-concurrency real system, calculating balance might need locking.
            // Here we trust the atomic update. The 'customer.totalPoints' is the source of truth for display.
            // Ideally, we should fetch the NEW total points and save it to the ledger.

            const updatedLedger = await tx.pointsLedger.update({
                where: { ledgerId: ledger.ledgerId },
                data: {
                    balanceAfter: customer.totalPoints,
                },
            });

            return { customer, ledger: updatedLedger };
        });

        // Send WhatsApp Notification
        // We must fetch phone number first (or return it from prisma update)
        // The result from update contains the customer info.
        if (result.customer) {
            const { sendWhatsAppMessage } = await import("@/lib/whatsapp");
            const msg = `Thank you for shopping with us 😊\nBill: ₹${billAmount}\nPoints earned: ${pointsEarned}\nTotal points: ${result.customer.totalPoints}\nValid till: ${new Date(new Date().setMonth(new Date().getMonth() + 6)).toLocaleDateString()}`;

            // Fire and forget or await? Let's await for now for easier debugging
            await sendWhatsAppMessage(result.customer.customerId, result.customer.phoneNumber, "TXN", msg);
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error processing earn transaction:", error);
        return NextResponse.json(
            { error: "Transaction failed", details: String(error) },
            { status: 500 }
        );
    }
}
