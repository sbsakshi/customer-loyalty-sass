import prisma from "./prisma";

// Environment variables for Meta WhatsApp Cloud API
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_API_URL = `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

type MessageType = "WELCOME" | "TXN" | "EXPIRY" | "PROMO";

interface SendMessageResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

function formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, "");
    // Add India country code if not present
    if (digits.length === 10) {
        return `91${digits}`;
    }
    return digits;
}

/**
 * Sends a WhatsApp message and logs it to the database.
 * Uses hello_world template for initiating conversations.
 */
export async function sendWhatsAppMessage(
    customerId: string,
    phoneNumber: string,
    messageType: MessageType,
    text: string
): Promise<SendMessageResult> {
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Use template message (required for initiating conversations)
    const body = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "template",
        template: {
            name: "hello_world",
            language: { code: "en_US" }
        }
    };

    let success = false;
    let apiResponse = null;
    let errorMsg = undefined;

    // 2. Send to Meta API (only if configured)
    if (WHATSAPP_API_TOKEN && WHATSAPP_PHONE_NUMBER_ID) {
        try {
            const res = await fetch(WHATSAPP_API_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            apiResponse = await res.json();

            if (!res.ok) {
                console.error("WhatsApp API Error:", apiResponse);
                errorMsg = apiResponse.error?.message || "Unknown API Error";
            } else {
                success = true;
            }
        } catch (e: unknown) {
            console.error("WhatsApp Network Error:", e);
            errorMsg = e instanceof Error ? e.message : String(e);
        }
    } else {
        // Simulator Mode
        console.log(`[WhatsApp Simulator] To: ${phoneNumber} | Msg: ${text}`);
        success = true; // Assume success in simulator
    }

    // 3. Log to Database
    try {
        await prisma.messageLog.create({
            data: {
                customerId,
                messageType,
                content: text,
                status: success ? "SENT" : "FAILED",
            },
        });
    } catch (logError) {
        console.error("Failed to log message:", logError);
    }

    return { success, messageId: apiResponse?.messages?.[0]?.id, error: errorMsg };
}
