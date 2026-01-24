"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, X, Store, CheckCircle2, Gift } from "lucide-react";
import Navbar from "@/components/Navbar";
import CustomerSearch from "@/components/CustomerSearch";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function BillingPage() {
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [billAmount, setBillAmount] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const pointsEarned = billAmount ? Math.floor(parseFloat(billAmount) * 0.10) : 0;

    async function handleTransaction() {
        if (!selectedCustomer || !billAmount) return;
        setLoading(true);

        try {
            const res = await fetch("/api/transactions/earn", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerId: selectedCustomer.customerId,
                    billAmount,
                    description
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.error || "Transaction failed");
                setLoading(false);
                return;
            }

            const data = await res.json();
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setSelectedCustomer(null);
                setBillAmount("");
                setDescription("");
                router.refresh();
            }, 3000);
        } catch (error) {
            console.error(error);
            alert("Error processing transaction");
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen pb-20 bg-slate-50/50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-slate-900">New Purchase</h1>
                    <p className="text-slate-500">Record a sale and award loyalty points.</p>
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
                                            <div className="bg-orange-50 p-4 rounded-full inline-block mb-4">
                                                <Store className="w-8 h-8 text-orange-600" />
                                            </div>
                                            <h3 className="text-lg font-medium text-slate-900">Select Customer</h3>
                                            <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                                Search for a customer to begin a new billing transaction.
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
                                    <Card className="border-orange-200 shadow-xl shadow-orange-100/50">
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

                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="bg-orange-50 p-4 rounded-xl">
                                                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Membership ID</p>
                                                <p className="text-lg font-mono text-slate-900">{selectedCustomer.customerId}</p>
                                            </div>
                                            <div className="bg-emerald-50 p-4 rounded-xl">
                                                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Available Points</p>
                                                <p className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                                    {selectedCustomer.totalPoints}
                                                    <span className="text-xs bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full">Active</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Total Bill Amount</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xl">₹</span>
                                                    <input
                                                        type="number"
                                                        value={billAmount}
                                                        onChange={(e) => setBillAmount(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-4 text-3xl font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder:text-slate-300"
                                                        placeholder="0.00"
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>

                                            <Input
                                                label="Note / Invoice #"
                                                placeholder="Optional description"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                            />
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
                                className="sticky top-24"
                            >
                                <Card className={success ? "bg-emerald-500 text-white border-emerald-400" : ""}>
                                    {success ? (
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="text-center py-8"
                                        >
                                            <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                                                <CheckCircle2 className="w-10 h-10 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">Success!</h3>
                                            <p className="text-emerald-100">Points awarded and message sent.</p>
                                        </motion.div>
                                    ) : (
                                        <>
                                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                                <Wallet className="w-5 h-5 text-orange-500" />
                                                Summary
                                            </h3>

                                            <div className="space-y-4 mb-8">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-500">Bill Amount</span>
                                                    <span className="font-medium">₹{billAmount || "0"}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-500">Rate</span>
                                                    <span className="font-medium text-slate-500">10%</span>
                                                </div>
                                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                                    <span className="font-medium text-slate-900">Points Earned</span>
                                                    <span className="text-2xl font-bold text-orange-600 flex items-center gap-1">
                                                        +{pointsEarned}
                                                        <Gift className="w-4 h-4" />
                                                    </span>
                                                </div>
                                            </div>

                                            <Button
                                                className="w-full h-12 text-lg shadow-xl shadow-orange-500/20"
                                                onClick={handleTransaction}
                                                disabled={loading || !selectedCustomer || !billAmount}
                                                isLoading={loading}
                                            >
                                                Confirm Transaction
                                            </Button>
                                        </>
                                    )}
                                </Card>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </main>
    );
}
