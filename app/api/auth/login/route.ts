import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        // Check credentials against Environment Variables
        const validUsername = process.env.ADMIN_USERNAME || "admin";
        const validPassword = process.env.ADMIN_PASSWORD || "password";

        if (username === validUsername && password === validPassword) {
            // Generate JWT
            const secret = new TextEncoder().encode(
                process.env.ADMIN_SECRET || "default_secret_please_change"
            );

            const token = await new SignJWT({ role: "admin" })
                .setProtectedHeader({ alg: "HS256" })
                .setExpirationTime("24h")
                .sign(secret);

            // Set Cookie
            const response = NextResponse.json({ success: true });
            response.cookies.set("admin_session", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 60 * 60 * 24, // 1 day
                path: "/",
            });

            return response;
        } else {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
