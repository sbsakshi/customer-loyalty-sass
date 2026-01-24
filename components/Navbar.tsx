"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { Home, Users, CreditCard, Gift, BarChart2, Store, LogOut } from "lucide-react";

const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Billing", href: "/billing", icon: CreditCard },
    { name: "Redeem", href: "/redeem", icon: Gift },
    { name: "Reports", href: "/reports", icon: BarChart2 },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-4 z-50 px-4 mb-8"
        >
            <div className="bg-white mx-auto max-w-7xl rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex items-center justify-between h-16 px-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-600 rounded-lg shadow-md shadow-orange-500/30">
                            <Store className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-extrabold text-2xl text-slate-900 tracking-tight hidden sm:block">
                            Manbhavan<span className="text-orange-600">Store</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={clsx(
                                        "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                                        isActive
                                            ? "text-orange-600"
                                            : "text-slate-600 hover:text-orange-600 hover:bg-orange-50"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            className="absolute inset-0 bg-orange-100 rounded-lg -z-10"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <item.icon className="h-4 w-4" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                            Live
                        </span>

                        <button
                            onClick={async () => {
                                await fetch("/api/auth/logout", { method: "POST" });
                                window.location.href = "/login";
                            }}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Sign Out"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
