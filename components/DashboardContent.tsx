"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Receipt, Plus, ArrowUpRight, Users, Coins, RefreshCw, Clock } from "lucide-react";
import AddCustomerModal from "@/components/AddCustomerModal";
import NewBillModal from "@/components/NewBillModal";

interface DashboardContentProps {
    customerCount: number;
    pointsDistributed: number;
}

export default function DashboardContent({ customerCount, pointsDistributed }: DashboardContentProps) {
    const [showAddCustomer, setShowAddCustomer] = useState(false);
    const [showNewBill, setShowNewBill] = useState(false);

    const activePoints = Math.round(pointsDistributed * 0.72);
    const expiringPoints = Math.round(pointsDistributed * 0.02);
    const earnedThisMonth = Math.round(pointsDistributed * 0.1);
    const redeemedThisMonth = Math.round(pointsDistributed * 0.026);
    const netChange = earnedThisMonth - redeemedThisMonth;

    return (
        <>
            <main className="min-h-screen px-12 py-8">
                {/* ========== 1. TOP GREETING ========== */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mb-6"
                >
                    <h1 className="text-[26px] font-semibold text-[#1F2937] tracking-tight italic">
                        Good to see you today
                    </h1>
                    <p className="text-[14px] text-[#6B7280] mt-1">
                        Your store is ready.
                    </p>
                </motion.div>

                {/* ========== 2. HERO ACTION ZONE ========== */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.25 }}
                    className="grid grid-cols-[1.6fr_1fr] gap-4 mb-6"
                >
                    {/* PRIMARY TILE - New Bill */}
                    <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowNewBill(true)}
                        className="h-[130px] rounded-2xl p-5 text-left cursor-pointer flex flex-col justify-between transition-all duration-300 ease-out shadow-[0_20px_60px_rgba(0,0,0,0.45)] hover:-translate-y-[2px] hover:shadow-[0_24px_64px_rgba(0,0,0,0.55)] active:scale-[0.98] relative overflow-hidden text-white focus-visible:ring-2 focus-visible:ring-slate-400/40"
                        style={{
                            background: "linear-gradient(135deg, #A29BFE 0%, #B8B0FF 50%, #D4CFFF 100%)"
                        }}
                    >
                        {/* Noise texture overlay */}
                        <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                            <filter id="noiseFilter">
                                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
                            </filter>
                            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
                        </svg>
                        {/* Depth overlay */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_60%)] pointer-events-none" />
                        <div className="w-10 h-10 bg-white/90 rounded-[10px] flex items-center justify-center relative z-10">
                            <Receipt className="w-5 h-5 text-[#6C5CE7]" strokeWidth={1.5} />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-[18px] font-semibold text-white">New Bill</h2>
                            <p className="text-[13px] text-white/80">Start your next transaction</p>
                        </div>
                    </motion.button>

                    {/* SECONDARY TILE - Add Customer */}
                    <motion.button
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAddCustomer(true)}
                        className="h-[130px] bg-white border border-slate-200 rounded-2xl p-5 text-left cursor-pointer flex flex-col justify-between shadow-[0_12px_32px_rgba(0,0,0,0.18)] transition-all duration-300 ease-out hover:-translate-y-[1px] hover:shadow-[0_18px_40px_rgba(0,0,0,0.25)] focus-visible:ring-2 focus-visible:ring-slate-400/40"
                    >
                        <div className="w-10 h-10 bg-[#F3F4F6] rounded-[10px] flex items-center justify-center">
                            <Plus className="w-5 h-5 text-slate-500" strokeWidth={2} />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-semibold text-[#1F2937]">Add Customer</h2>
                            <p className="text-[13px] text-[#6B7280]">Someone new to welcome</p>
                        </div>
                    </motion.button>
                </motion.div>

                {/* ========== 3. STATS GRID ========== */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                    className="grid grid-cols-3 gap-4 mb-6"
                >
                    {/* Column 1: THIS MONTH */}
                    <Link href="/reports" className="bg-slate-50 border border-slate-200/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] rounded-2xl p-6 h-full flex flex-col relative group hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-slate-400/40">
                        <ArrowUpRight className="w-4 h-4 text-slate-400 absolute top-4 right-4 group-hover:text-slate-500 transition-colors" strokeWidth={1.5} />
                        <p className="text-xs uppercase tracking-wider text-slate-500 mb-6">THIS MONTH</p>
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-baseline gap-3">
                                    <p className="text-[32px] font-semibold text-slate-900 leading-none">{earnedThisMonth}</p>
                                    <p className="text-xs uppercase tracking-wider text-slate-500">points<br/>earned</p>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-baseline gap-3">
                                    <p className="text-[32px] font-semibold text-slate-900 leading-none">{redeemedThisMonth}</p>
                                    <p className="text-xs uppercase tracking-wider text-slate-500">redeemed</p>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-baseline gap-3">
                                    <p className="text-[32px] font-medium text-emerald-500 leading-none">+{netChange}</p>
                                    <p className="text-xs uppercase tracking-wider text-slate-500">net</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Column 2: Customers + Points in Circulation */}
                    <div className="flex flex-col gap-4">
                        <Link href="/customers" className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_6px_18px_rgba(0,0,0,0.12)] flex-1 min-h-[180px] flex flex-col justify-between relative group hover:-translate-y-[1px] hover:shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-slate-400/40">
                            <ArrowUpRight className="w-4 h-4 text-slate-400 absolute top-4 right-4 group-hover:text-slate-500 transition-colors" strokeWidth={1.5} />
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
                                <p className="text-xs uppercase tracking-wider text-slate-500">customers</p>
                            </div>
                            <p className="text-[32px] font-semibold text-slate-900 leading-none">{customerCount}</p>
                        </Link>
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_6px_18px_rgba(0,0,0,0.12)] flex-1 min-h-[180px] flex flex-col justify-between hover:-translate-y-[1px] hover:shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition-all duration-300 ease-out">
                            <div className="flex items-center gap-2">
                                <RefreshCw className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
                                <p className="text-xs uppercase tracking-wider text-slate-500">points in circulation</p>
                            </div>
                            <p className="text-[32px] font-semibold text-slate-900 leading-none">{activePoints}</p>
                        </div>
                    </div>

                    {/* Column 3: Points Given + Expiring Soon */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_6px_18px_rgba(0,0,0,0.12)] flex-1 min-h-[150px] flex flex-col justify-between hover:-translate-y-[1px] hover:shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition-all duration-300 ease-out">
                            <div className="flex items-center gap-2">
                                <Coins className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
                                <p className="text-xs uppercase tracking-wider text-slate-500">points given</p>
                            </div>
                            <p className="text-[32px] font-semibold text-slate-900 leading-none">{pointsDistributed}</p>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_6px_18px_rgba(0,0,0,0.12)] flex-1 min-h-[150px] flex flex-col justify-between hover:-translate-y-[1px] hover:shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition-all duration-300 ease-out">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
                                <p className="text-xs uppercase tracking-wider text-slate-500">expiring soon</p>
                            </div>
                            <div>
                                <p className="text-[32px] font-semibold text-amber-500 leading-none">{expiringPoints}</p>
                                <p className="text-xs text-slate-500 mt-1">next 30 days</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ========== 4. JUST HAPPENED ========== */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.2 }}
                    className="mt-2"
                >
                    <div className="mb-4 border-t border-slate-200/40 pt-6">
                        <h3 className="text-sm font-medium text-slate-700">Just happened</h3>
                        <p className="text-xs text-slate-500">Your store, right now</p>
                    </div>

                    {/* Activity Entry */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_6px_18px_rgba(0,0,0,0.12)] mb-3 hover:-translate-y-[1px] hover:shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition-all duration-300 ease-out">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-[10px] bg-emerald-50 flex items-center justify-center">
                                    <ArrowUpRight className="w-5 h-5 text-emerald-500" strokeWidth={2} />
                                </div>
                                <div>
                                    <p className="text-[14px] font-medium text-slate-900">Rajesh Kumar</p>
                                    <p className="text-xs text-slate-500">₹450 bill</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[15px] font-semibold text-emerald-500">+45</p>
                                <p className="text-xs text-slate-500">2 min ago</p>
                            </div>
                        </div>
                    </div>

                    {/* Empty State */}
                    <div className="py-8 text-center">
                        <p className="text-sm text-slate-500">
                            Your next bill will show up here
                        </p>
                    </div>
                </motion.div>
            </main>

            {/* Modals */}
            <AddCustomerModal isOpen={showAddCustomer} onClose={() => setShowAddCustomer(false)} />
            <NewBillModal isOpen={showNewBill} onClose={() => setShowNewBill(false)} />
        </>
    );
}
