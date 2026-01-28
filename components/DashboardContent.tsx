"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Gift, TrendingUp, Clock, Plus, Receipt, ArrowUpRight } from "lucide-react";
import Button from "@/components/ui/Button";
import AddCustomerModal from "@/components/AddCustomerModal";
import NewBillModal from "@/components/NewBillModal";

interface DashboardContentProps {
    customerCount: number;
    pointsDistributed: number;
}

export default function DashboardContent({ customerCount, pointsDistributed }: DashboardContentProps) {
    const [showAddCustomer, setShowAddCustomer] = useState(false);
    const [showNewBill, setShowNewBill] = useState(false);

    // TODO: These values need to be fetched from the API
    // Using calculated/placeholder values based on available data
    const activePoints = Math.round(pointsDistributed * 0.72);
    const expiringPoints = Math.round(pointsDistributed * 0.02);

    return (
        <>
            <main className="min-h-screen p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-1">Welcome back</h1>
                        <p className="text-slate-500">Here's what's happening with your store today.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="white"
                            onClick={() => setShowAddCustomer(true)}
                            className="gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Customer
                        </Button>
                        <Button
                            variant="violet"
                            onClick={() => setShowNewBill(true)}
                            className="gap-2"
                        >
                            <Receipt className="w-4 h-4" />
                            New Bill
                        </Button>
                    </div>
                </div>

                {/* Stats Grid - First Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Total Customers */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                <ArrowUpRight className="w-3 h-3" />
                                +12%
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Total Customers</p>
                        <h3 className="text-4xl font-bold text-slate-900">{customerCount.toLocaleString()}</h3>
                        <p className="text-sm text-slate-400 mt-2">From last week</p>
                    </motion.div>

                    {/* Distributed */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                                <Gift className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Distributed</p>
                        <h3 className="text-4xl font-bold text-slate-900">{(pointsDistributed / 1000).toFixed(1)}K</h3>
                        <p className="text-sm text-emerald-600 font-medium mt-2">+8.2%</p>
                    </motion.div>

                    {/* Active */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Active</p>
                        <h3 className="text-4xl font-bold text-slate-900">{(activePoints / 1000).toFixed(1)}K</h3>
                        <p className="text-sm text-slate-400 mt-2">71.6%</p>
                    </motion.div>
                </div>

                {/* Stats Grid - Second Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Expiring */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Expiring</p>
                        <h3 className="text-4xl font-bold text-slate-900">{expiringPoints.toLocaleString()}</h3>
                        <p className="text-sm text-slate-400 mt-2">Next 30 days</p>
                    </motion.div>

                    {/* This Month Overview - Purple Gradient Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="md:col-span-2 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden"
                    >
                        {/* Background decoration */}
                        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold">This Month Overview</h3>
                            </div>

                            <div className="grid grid-cols-3 gap-8">
                                <div>
                                    <p className="text-sm text-white/70 uppercase tracking-wide mb-1">Earned</p>
                                    <h4 className="text-3xl font-bold">{(pointsDistributed * 0.1 / 1000).toFixed(1)}K</h4>
                                </div>
                                <div>
                                    <p className="text-sm text-white/70 uppercase tracking-wide mb-1">Redeemed</p>
                                    <h4 className="text-3xl font-bold">{(pointsDistributed * 0.026 / 1000).toFixed(1)}K</h4>
                                </div>
                                <div>
                                    <p className="text-sm text-white/70 uppercase tracking-wide mb-1">Net Change</p>
                                    <h4 className="text-3xl font-bold text-emerald-300">+{(pointsDistributed * 0.074 / 1000).toFixed(1)}K</h4>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
                        <p className="text-sm text-slate-500">Latest customer transactions</p>
                    </div>

                    {/* TODO: Fetch recent transactions from API */}
                    <div className="divide-y divide-slate-100">
                        <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">Rajesh Kumar</p>
                                    <p className="text-sm text-slate-500">Bill: ₹450</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-emerald-600">+45</p>
                                <p className="text-xs text-slate-400">2 min ago</p>
                            </div>
                        </div>

                        <div className="p-8 text-center text-slate-400">
                            <p className="text-sm">More transactions will appear here</p>
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* Modals */}
            <AddCustomerModal isOpen={showAddCustomer} onClose={() => setShowAddCustomer(false)} />
            <NewBillModal isOpen={showNewBill} onClose={() => setShowNewBill(false)} />
        </>
    );
}
