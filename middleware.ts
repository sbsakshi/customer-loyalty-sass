import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
    // 1. Define protected routes
    const protectedPaths = ["/customers", "/billing", "/redeem", "/reports"];
    const isProtected = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (!isProtected) {
        return NextResponse.next();
    }

    // 2. Check for Token
    const token = request.cookies.get("admin_session")?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // 3. Verify Token
    try {
        const secret = new TextEncoder().encode(
            process.env.ADMIN_SECRET || "default_secret_please_change"
        );
        await jwtVerify(token, secret);
        return NextResponse.next();
    } catch {
        // Token invalid/expired
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (login/logout should be public)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - login (login page)
         */
        "/customers/:path*",
        "/billing/:path*",
        "/redeem/:path*",
        "/reports/:path*",
    ],
};
