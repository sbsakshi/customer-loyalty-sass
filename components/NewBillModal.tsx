"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";

interface NewBillModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NewBillModal({ isOpen, onClose }: NewBillModalProps) {
    const [query, setQuery] = useState("");
    const [debouncedQuery] = useDebounce(query, 500);
    const [customers, setCustomers] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [billAmount, setBillAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!debouncedQuery) {
            setCustomers([]);
            return;
        }

        async function search() {
            setSearchLoading(true);
            try {
                const res = await fetch(`/api/customers?search=${encodeURIComponent(debouncedQuery)}`);
                if (res.ok) {
                    const data = await res.json();
                    setCustomers(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setSearchLoading(false);
            }
        }
        search();
    }, [debouncedQuery]);

    // Load all customers when modal opens
    useEffect(() => {
        if (isOpen && !query) {
            async function loadCustomers() {
                setSearchLoading(true);
                try {
                    const res = await fetch(`/api/customers?search=`);
                    if (res.ok) {
                        const data = await res.json();
                        setCustomers(data);
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    setSearchLoading(false);
                }
            }
            loadCustomers();
        }
    }, [isOpen, query]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedCustomer || !billAmount) return;

        setLoading(true);

        try {
            const res = await fetch("/api/transactions/earn", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerId: selectedCustomer.customerId,
                    billAmount,
                    description: ""
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.error || "Transaction failed");
                setLoading(false);
                return;
            }

            router.refresh();
            handleClose();
        } catch (error) {
            console.error(error);
            alert("Error processing transaction");
        } finally {
            setLoading(false);
        }
    }

    function handleClose() {
        if (!loading) {
            setQuery("");
            setSelectedCustomer(null);
            setBillAmount("");
            setCustomers([]);
            onClose();
        }
    }

    function handleSelectCustomer(customer: any) {
        setSelectedCustomer(customer);
        setQuery("");
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900">New Bill</h2>
                            <button
                                onClick={handleClose}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Customer Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Select Customer
                                </label>

                                {selectedCustomer ? (
                                    <div className="flex items-center justify-between p-3 bg-violet-50 border border-violet-200 rounded-xl">
                                        <div>
                                            <p className="font-medium text-slate-900">{selectedCustomer.name}</p>
                                            <p className="text-sm text-slate-500">{selectedCustomer.phoneNumber}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-violet-600">{selectedCustomer.totalPoints} pts</span>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedCustomer(null)}
                                                className="text-slate-400 hover:text-slate-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                                placeholder="Search customer..."
                                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                            />
                                            {searchLoading && (
                                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-500 animate-spin" />
                                            )}
                                        </div>

                                        {/* Customer List */}
                                        {customers.length > 0 && (
                                            <div className="mt-2 max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                                                {customers.map((customer) => (
                                                    <div
                                                        key={customer.customerId}
                                                        onClick={() => handleSelectCustomer(customer)}
                                                        className="flex items-center justify-between p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                                                    >
                                                        <div>
                                                            <p className="font-medium text-slate-900">{customer.name}</p>
                                                            <p className="text-sm text-slate-500">{customer.phoneNumber}</p>
                                                        </div>
                                                        <span className="text-sm font-medium text-violet-600">{customer.totalPoints} pts</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Bill Amount */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Bill Amount (₹)
                                </label>
                                <input
                                    type="number"
                                    value={billAmount}
                                    onChange={(e) => setBillAmount(e.target.value)}
                                    placeholder="Enter bill amount"
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="white"
                                    className="flex-1"
                                    onClick={handleClose}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="violet"
                                    className="flex-1"
                                    disabled={!selectedCustomer || !billAmount || loading}
                                    isLoading={loading}
                                >
                                    Create Bill
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
