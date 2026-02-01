"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { Home, Users, FileText, ArrowUpRight, Gift } from "lucide-react";

const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Bills", href: "/billing", icon: FileText },
    { name: "Reports", href: "/reports", icon: ArrowUpRight },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.aside
            initial={{ x: -12, opacity: 0 }}
            animate={{ x: 0, opacity: 1, width: isExpanded ? 240 : 76 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            className="fixed left-4 top-4 bottom-4 flex flex-col z-40 overflow-hidden rounded-2xl shadow-[2px_0_12px_rgba(0,0,0,0.25)]"
            style={{
                background: "linear-gradient(180deg, #A29BFE 0%, #B8B0FF 50%, #D4CFFF 100%)"
            }}
        >
            {/* Store identity - Brand */}
            <div className="px-4 py-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white flex-shrink-0">
                        <Gift className="h-5 w-5 text-[#6C5CE7]" strokeWidth={2} />
                    </div>
                    <motion.div
                        animate={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? "auto" : 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden whitespace-nowrap"
                    >
                        <span className="font-semibold text-[15px] text-white block leading-tight">
                            Manbhavan
                        </span>
                        <span className="text-xs text-white/80">Loyalty System</span>
                    </motion.div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 pt-2">
                <div className="space-y-1.5">
                    {navItems.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 + 0.1 }}
                            >
                                <Link
                                    href={item.href}
                                    className={clsx(
                                        "flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-150 focus-visible:ring-2 focus-visible:ring-slate-400/40",
                                        isActive
                                            ? "bg-white/15 text-white font-medium"
                                            : "text-white/60 hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    <item.icon
                                        className={clsx("h-5 w-5 flex-shrink-0", isActive ? "text-white" : "text-white/60")}
                                        strokeWidth={2}
                                    />
                                    <motion.span
                                        animate={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? "auto" : 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="overflow-hidden whitespace-nowrap"
                                    >
                                        {item.name}
                                    </motion.span>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </nav>

            {/* User section */}
            <div className="px-3 py-4 border-t border-white/25">
                <div className="flex items-center gap-2.5 px-1">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[12px] font-semibold text-[#6C5CE7] flex-shrink-0">
                        N
                    </div>
                    <motion.div
                        animate={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? "auto" : 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex-1 min-w-0 overflow-hidden whitespace-nowrap"
                    >
                        <p className="text-[13px] font-medium text-white truncate">Store Admin</p>
                        <p className="text-[11px] text-white/80 truncate">admin@manbhavan.com</p>
                    </motion.div>
                </div>
            </div>
        </motion.aside>
    );
}
