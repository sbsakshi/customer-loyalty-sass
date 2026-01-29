import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import Sidebar from "@/components/Sidebar";

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

    return (
        <div className="min-h-screen bg-[#F5F5F5] pr-16 pl-8">
            <Sidebar />
            <div className="pl-[100px]">
                {children}
            </div>
        </div>
    );
}
