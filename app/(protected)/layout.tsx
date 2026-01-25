import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!token) {
        redirect("/login");
    }

    try {
        const secret = new TextEncoder().encode(
            process.env.ADMIN_SECRET || "default_secret_please_change"
        );
        await jwtVerify(token, secret);
    } catch {
        redirect("/login");
    }

    return <>{children}</>;
}
