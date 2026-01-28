"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import { Users, CreditCard, Gift, TrendingUp, BarChart } from "lucide-react";

export default function ReportsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/reports");
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen p-8">
                <div className="flex justify-center items-center h-96">
                    <p className="text-slate-500">Loading Report...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen p-8">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-slate-900 mb-1">Analytics</h1>
                <p className="text-slate-500">Track your business growth and loyalty performance.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm">Total Customers</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats?.totalCustomers || 0}</h3>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl">
                            <Gift className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm">Points Awarded</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats?.totalPointsIssued || 0}</h3>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm">Points Redeemed</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats?.totalPointsRedeemed || 0}</h3>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                            <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm">Total Transactions</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats?.totalTransactions || 0}</h3>
                        </div>
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white border border-slate-100 rounded-2xl p-16 text-center shadow-sm"
            >
                <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
                    <BarChart className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">Detailed Charts</h3>
                <p className="text-slate-500">Advanced transaction history visualization coming soon.</p>
            </motion.div>
        </main>
    );
}
