import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function generateMembershipId() {
    // Generate 8 digit number
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, phoneNumber, address } = body;

        // VALIDATION
        if (!name || !phoneNumber || !address) {
            return NextResponse.json(
                { error: "Name, Phone Number (10 digits), and Address are required" },
                { status: 400 }
            );
        }

        // Phone Validation (Exact 10 digits)
        if (!/^\d{10}$/.test(phoneNumber)) {
            return NextResponse.json({ error: "Phone number must be exactly 10 digits" }, { status: 400 });
        }

        // Check if phone already exists
        const existing = await prisma?.customer.findUnique({
            where: { phoneNumber },
        });

        if (existing) {
            return NextResponse.json(
                { error: "Customer already exists with this phone number", customer: existing },
                { status: 409 }
            );
        }

        let customerId = generateMembershipId();
        let isUnique = false;
        let retries = 0;

        // Ensure uniqueness of ID
        while (!isUnique && retries < 5) {
            const check = await prisma?.customer.findUnique({
                where: { customerId },
            });
            if (!check) {
                isUnique = true;
            } else {
                customerId = generateMembershipId();
                retries++;
            }
        }

        if (!isUnique) {
            throw new Error("Failed to generate unique ID");
        }

        const newCustomer = await prisma?.customer.create({
            data: {
                customerId,
                name,
                phoneNumber,
                address,
                totalPoints: 0,
                isActive: true,
            },
        });

        // Send Welcome Message
        const { sendWhatsAppMessage } = await import("@/lib/whatsapp");
        const welcomeMsg = `Welcome to our Loyalty Program, ${name}! 🌸\nYour Membership ID is: ${customerId}.\nShow this number at billing to earn points. Happy Shopping!`;

        // We don't await this to keep API fast? Or we do for reliability?
        // Let's await but catch error so we don't fail registration
        try {
            await sendWhatsAppMessage(customerId, phoneNumber, "WELCOME", welcomeMsg);
        } catch (e) {
            console.error("Failed to send welcome message", e);
        }

        return NextResponse.json(newCustomer, { status: 201 });
    } catch (error) {
        console.error("Error creating customer:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    try {
        if (!search) {
            // Return latest 20 customers
            const customers = await prisma?.customer.findMany({
                take: 20,
                orderBy: { createdAt: "desc" },
            });
            return NextResponse.json(customers);
        }

        // Search by Phone OR ID
        const customers = await prisma?.customer.findMany({
            where: {
                OR: [
                    { phoneNumber: { contains: search } },
                    { customerId: { contains: search } },
                    { name: { contains: search } }
                ]
            },
            take: 20,
        });

        return NextResponse.json(customers);
    } catch (error) {
        console.error("Error fetching customers:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
