import prisma from "./prisma";

// Environment variables for Meta WhatsApp Cloud API
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_API_URL = `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

type MessageType = "WELCOME" | "TXN" | "EXPIRY" | "PROMO";

interface SendMessageResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

/**
 * Sends a WhatsApp message and logs it to the database.
 */
export async function sendWhatsAppMessage(
    customerId: string,
    phoneNumber: string,
    messageType: MessageType,
    text: string
): Promise<SendMessageResult> {
    // 1. Prepare Request
    const body = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phoneNumber,
        type: "text",
        text: { preview_url: false, body: text },
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
        } catch (e: any) {
            console.error("WhatsApp Network Error:", e);
            errorMsg = e.message;
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
