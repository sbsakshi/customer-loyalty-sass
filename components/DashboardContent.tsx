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
                        className="h-[130px] rounded-[16px] p-5 text-left cursor-pointer flex flex-col justify-between transition-shadow hover:shadow-[0_24px_48px_rgba(108,92,231,0.25)] relative overflow-hidden"
                        style={{
                            background: "linear-gradient(135deg, #A29BFE 0%, #C4B5FD 50%, #DDD6F3 100%)"
                        }}
                    >
                        {/* Halftone dots texture */}
                        <div className="absolute inset-0 pointer-events-none">
                            {/* Top-left corner - Dense cluster */}
                       
                        </div>
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
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAddCustomer(true)}
                        className="h-[130px] bg-white rounded-[16px] p-5 text-left cursor-pointer flex flex-col justify-between shadow-[0px_2px_8px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0px_4px_16px_rgba(0,0,0,0.08)]"
                    >
                        <div className="w-10 h-10 bg-[#F3F4F6] rounded-[10px] flex items-center justify-center">
                            <Plus className="w-5 h-5 text-[#6B7280]" strokeWidth={2} />
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
                    <Link href="/reports" className="bg-white rounded-[16px] p-6 shadow-[0px_2px_8px_rgba(0,0,0,0.04)] h-full flex flex-col relative group hover:shadow-[0px_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
                        <ArrowUpRight className="w-4 h-4 text-[#D1D5DB] absolute top-4 right-4 group-hover:text-[#6B7280] transition-colors" strokeWidth={1.5} />
                        <p className="text-[11px] font-medium text-[#9CA3AF] tracking-[0.5px] uppercase mb-6">THIS MONTH</p>
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-baseline gap-3">
                                    <p className="text-[42px] font-semibold text-[#1F2937] leading-none">{earnedThisMonth}</p>
                                    <p className="text-[13px] text-[#6B7280]">points<br/>earned</p>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-baseline gap-3">
                                    <p className="text-[32px] font-semibold text-[#1F2937] leading-none">{redeemedThisMonth}</p>
                                    <p className="text-[13px] text-[#6B7280]">redeemed</p>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-baseline gap-3">
                                    <p className="text-[26px] font-semibold text-[#16A34A] leading-none">+{netChange}</p>
                                    <p className="text-[13px] text-[#6B7280]">net</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Column 2: Customers + Points in Circulation */}
                    <div className="flex flex-col gap-4">
                        <Link href="/customers" className="bg-white rounded-[16px] p-6 shadow-[0px_2px_8px_rgba(0,0,0,0.04)] flex-1 min-h-[180px] flex flex-col justify-between relative group hover:shadow-[0px_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
                            <ArrowUpRight className="w-4 h-4 text-[#D1D5DB] absolute top-4 right-4 group-hover:text-[#6B7280] transition-colors" strokeWidth={1.5} />
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-[#9CA3AF]" strokeWidth={1.5} />
                                <p className="text-[13px] text-[#6B7280]">customers</p>
                            </div>
                            <p className="text-[36px] font-semibold text-[#1F2937] leading-none">{customerCount}</p>
                        </Link>
                        <div className="bg-white rounded-[16px] p-6 shadow-[0px_2px_8px_rgba(0,0,0,0.04)] flex-1 min-h-[180px] flex flex-col justify-between">
                            <div className="flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 text-[#9CA3AF]" strokeWidth={1.5} />
                                <p className="text-[13px] text-[#6B7280]">points in circulation</p>
                            </div>
                            <p className="text-[36px] font-semibold text-[#1F2937] leading-none">{activePoints}</p>
                        </div>
                    </div>

                    {/* Column 3: Points Given + Expiring Soon */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-white rounded-[16px] p-6 shadow-[0px_2px_8px_rgba(0,0,0,0.04)] flex-1 min-h-[150px] flex flex-col justify-between">
                            <div className="flex items-center gap-2">
                                <Coins className="w-4 h-4 text-[#9CA3AF]" strokeWidth={1.5} />
                                <p className="text-[13px] text-[#6B7280]">points given</p>
                            </div>
                            <p className="text-[36px] font-semibold text-[#1F2937] leading-none">{pointsDistributed}</p>
                        </div>
                        <div className="bg-white rounded-[16px] p-6 shadow-[0px_2px_8px_rgba(0,0,0,0.04)] flex-1 min-h-[150px] flex flex-col justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#F59E0B]" strokeWidth={1.5} />
                                <p className="text-[13px] text-[#6B7280]">expiring soon</p>
                            </div>
                            <div>
                                <p className="text-[36px] font-semibold text-[#F59E0B] leading-none">{expiringPoints}</p>
                                <p className="text-[12px] text-[#9CA3AF] mt-1">next 30 days</p>
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
                    <div className="mb-4">
                        <h3 className="text-[15px] font-semibold text-[#1F2937]">Just happened</h3>
                        <p className="text-[13px] text-[#9CA3AF]">Your store, right now</p>
                    </div>

                    {/* Activity Entry */}
                    <div className="bg-white rounded-[14px] p-4 shadow-[0px_2px_8px_rgba(0,0,0,0.04)] mb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-[10px] bg-[#F0FDF4] flex items-center justify-center">
                                    <ArrowUpRight className="w-4 h-4 text-[#16A34A]" strokeWidth={2} />
                                </div>
                                <div>
                                    <p className="text-[14px] font-medium text-[#1F2937]">Rajesh Kumar</p>
                                    <p className="text-[13px] text-[#6B7280]">₹450 bill</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[15px] font-semibold text-[#16A34A]">+45</p>
                                <p className="text-[12px] text-[#9CA3AF]">2 min ago</p>
                            </div>
                        </div>
                    </div>

                    {/* Empty State */}
                    <div className="py-8 text-center">
                        <p className="text-[14px] text-[#9CA3AF]">
                            Your next bill will show up here 👀
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
