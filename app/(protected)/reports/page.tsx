"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
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
            <main className="min-h-screen bg-slate-50/50">
                <Navbar />
                <div className="flex justify-center items-center h-96">
                    <p className="text-slate-500">Loading Report...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50/50 pb-20">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Store Analytics</h1>
                    <p className="text-slate-500">Track your business growth and loyalty performance.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <Card className="bg-orange-350 text-white border-none">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-orange-100 text-sm">Total Customers</p>
                                <h3 className="text-2xl font-bold">{stats?.totalCustomers || 0}</h3>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                                <Gift size={24} />
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm">Points Awarded</p>
                                <h3 className="text-2xl font-bold text-slate-900">{stats?.totalPointsIssued || 0}</h3>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm">Points Redeemed</p>
                                <h3 className="text-2xl font-bold text-slate-900">{stats?.totalPointsRedeemed || 0}</h3>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm">Total Transactions</p>
                                <h3 className="text-2xl font-bold text-slate-900">{stats?.totalTransactions || 0}</h3>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-2xl p-16 text-center text-slate-400">
                    <div className="inline-block p-4 bg-slate-50 rounded-full mb-4">
                        <BarChart className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-1">Detailed Charts</h3>
                    <p>Advanced transaction history visualization coming soon.</p>
                </div>
            </div>
        </main>
    );
}
