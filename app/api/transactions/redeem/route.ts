import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

        // 1. Transaction
        const result = await prisma?.$transaction(async (tx: any) => {
            // Check Balance
            const customer = await tx.customer.findUnique({
                where: { customerId },
            });

            if (!customer || customer.totalPoints < points) {
                throw new Error("Insufficient points balance");
            }

            // Create Ledger (Redeem)
            const ledger = await tx.pointsLedger.create({
                data: {
                    customerId,
                    transactionType: "REDEEM",
                    points: -points, // Negative for redemption
                    balanceAfter: customer.totalPoints - points,
                    description: description || "Redemption",
                    remainingPoints: 0, // Not applicable for redemption entry itself
                    expiryDate: null,
                },
            });

            // Update Customer
            const updatedCustomer = await tx.customer.update({
                where: { customerId },
                data: {
                    totalPoints: { decrement: points },
                },
            });

            // Note: FIFO Logic for burning points from specific earn entries is complex.
            // For now, we just decrement the total. A proper system would iterate EARN entries 
            // and decrement their 'remainingPoints'. 

            return { customer: updatedCustomer, ledger };
        });

        // Send WhatsApp Notification
        if (result.customer) {
            const { sendWhatsAppMessage } = await import("@/lib/whatsapp");
            const msg = `Points Redeemed! 🎁\nRedeemed: ${points}\nRemaining Balance: ${result.customer.totalPoints}\nEnjoy your reward!`;

            try {
                await sendWhatsAppMessage(result.customer.customerId, result.customer.phoneNumber, "TXN", msg);
            } catch (e) {
                console.error("Failed to send whatsapp", e);
            }
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Error processing redemption:", error);
        return NextResponse.json(
            { error: error.message || "Transaction failed" },
            { status: error.message === "Insufficient points balance" ? 400 : 500 }
        );
    }
}
