"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, Store, CheckCircle2, Ticket } from "lucide-react";
import CustomerSearch from "@/components/CustomerSearch";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function RedeemPage() {
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [pointsToRedeem, setPointsToRedeem] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    async function handleRedemption() {
        if (!selectedCustomer || !pointsToRedeem) return;
        setLoading(true);

        try {
            const res = await fetch("/api/transactions/redeem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerId: selectedCustomer.customerId,
                    pointsToRedeem,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.error || "Redemption failed");
                setLoading(false);
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setSelectedCustomer(null);
                setPointsToRedeem("");
                router.refresh();
            }, 3000);
        } catch (error) {
            console.error(error);
            alert("Error processing redemption");
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen p-8">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-slate-900 mb-1">Redeem Points</h1>
                <p className="text-slate-500">Use loyalty points for discounts or rewards.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Panel: Customer Selection */}
                <div className="md:col-span-2 space-y-6">
                    <AnimatePresence mode="wait">
                        {!selectedCustomer ? (
                            <motion.div
                                key="search"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <Card className="min-h-[300px] flex flex-col justify-center items-center">
                                    <div className="text-center mb-6">
                                        <div className="bg-violet-50 p-4 rounded-full inline-block mb-4">
                                            <Store className="w-8 h-8 text-violet-500" />
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-900">Select Customer</h3>
                                        <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                            Find the customer who wants to redeem points.
                                        </p>
                                    </div>
                                    <div className="w-full max-w-sm">
                                        <CustomerSearch onSelect={setSelectedCustomer} placeholder="Type name or phone number..." />
                                    </div>
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Card className="border-violet-200 shadow-xl shadow-violet-100/50">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">{selectedCustomer.name}</h3>
                                            <p className="text-slate-500">{selectedCustomer.phoneNumber}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedCustomer(null)}
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                        >
                                            Change
                                            <X className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>

                                    <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 text-white p-6 rounded-2xl mb-8 relative overflow-hidden">
                                        <p className="text-violet-100 uppercase text-xs font-semibold tracking-wider mb-1">Available Balance</p>
                                        <h2 className="text-4xl font-bold flex items-center gap-2">
                                            {selectedCustomer.totalPoints}
                                            <Gift className="w-6 h-6 opacity-75" />
                                        </h2>
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Gift size={100} />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Points to Redeem</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xl">
                                                    <Ticket className="w-5 h-5" />
                                                </span>
                                                <input
                                                    type="number"
                                                    value={pointsToRedeem}
                                                    onChange={(e) => setPointsToRedeem(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-4 text-3xl font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all placeholder:text-slate-300"
                                                    placeholder="0"
                                                    autoFocus
                                                />
                                            </div>
                                            <p className="text-xs text-slate-500 mt-2 ml-1">
                                                Max redeemable: {selectedCustomer.totalPoints} points
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Panel: Transaction Summary */}
                <div className="md:col-span-1">
                    <AnimatePresence>
                        <motion.div
                            layout
                            className="sticky top-8"
                        >
                            <Card className={success ? "bg-violet-500 text-white border-violet-400" : ""}>
                                {success ? (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-center py-8"
                                    >
                                        <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                                            <CheckCircle2 className="w-10 h-10 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">Redeemed!</h3>
                                        <p className="text-violet-100">Balance updated.</p>
                                    </motion.div>
                                ) : (
                                    <>
                                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                            <Ticket className="w-5 h-5 text-violet-500" />
                                            Summary
                                        </h3>

                                        <div className="space-y-4 mb-8">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500">Redeem Points</span>
                                                <span className="font-medium text-red-500">-{pointsToRedeem || "0"}</span>
                                            </div>
                                            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                                <span className="font-medium text-slate-900">New Balance</span>
                                                <span className="text-xl font-bold text-violet-600 flex items-center gap-1">
                                                    {(selectedCustomer?.totalPoints || 0) - (parseInt(pointsToRedeem) || 0)}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="violet"
                                            className="w-full h-12 text-lg"
                                            onClick={handleRedemption}
                                            disabled={loading || !selectedCustomer || !pointsToRedeem || parseInt(pointsToRedeem) > selectedCustomer.totalPoints}
                                            isLoading={loading}
                                        >
                                            Confirm Redeem
                                        </Button>
                                    </>
                                )}
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </main>
    );
}
