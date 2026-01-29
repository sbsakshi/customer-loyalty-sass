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
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                            <div>
                                <h2 className="text-[17px] font-semibold text-[#1F2937]">New bill</h2>
                                <p className="text-[13px] text-[#6B7280]">Record a purchase</p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[rgba(0,0,0,0.03)] rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Customer Selection */}
                            <div>
                                <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                                    Who is this for?
                                </label>

                                {selectedCustomer ? (
                                    <div className="flex items-center justify-between p-3 bg-[#EDEBFF] border border-[rgba(108,92,231,0.15)] rounded-xl">
                                        <div>
                                            <p className="font-medium text-[#1F2937]">{selectedCustomer.name}</p>
                                            <p className="text-[13px] text-[#6B7280]">{selectedCustomer.phoneNumber}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[13px] font-medium text-[#6C5CE7]">{selectedCustomer.totalPoints} pts</span>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedCustomer(null)}
                                                className="text-[#9CA3AF] hover:text-[#6B7280]"
                                            >
                                                <X className="w-4 h-4" strokeWidth={1.5} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" strokeWidth={1.5} />
                                            <input
                                                type="text"
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                                placeholder="Search by name or phone..."
                                                className="w-full pl-10 pr-4 py-3 bg-[#FAFAFA] border border-[rgba(0,0,0,0.06)] rounded-xl text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#A29BFE] transition-all"
                                            />
                                            {searchLoading && (
                                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6C5CE7] animate-spin" />
                                            )}
                                        </div>

                                        {customers.length > 0 && (
                                            <div className="mt-2 max-h-48 overflow-y-auto bg-white border border-[rgba(0,0,0,0.06)] rounded-xl divide-y divide-[rgba(0,0,0,0.04)] shadow-lg">
                                                {customers.map((customer) => (
                                                    <div
                                                        key={customer.customerId}
                                                        onClick={() => handleSelectCustomer(customer)}
                                                        className="flex items-center justify-between p-3 hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                                                    >
                                                        <div>
                                                            <p className="font-medium text-[#1F2937]">{customer.name}</p>
                                                            <p className="text-[13px] text-[#6B7280]">{customer.phoneNumber}</p>
                                                        </div>
                                                        <span className="text-[13px] font-medium text-[#6C5CE7]">{customer.totalPoints} pts</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Bill Amount */}
                            <div>
                                <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                                    Bill amount
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] text-[15px]">₹</span>
                                    <input
                                        type="number"
                                        value={billAmount}
                                        onChange={(e) => setBillAmount(e.target.value)}
                                        placeholder="0"
                                        min="0"
                                        step="0.01"
                                        className="w-full pl-8 pr-4 py-3 bg-[#FAFAFA] border border-[rgba(0,0,0,0.06)] rounded-xl text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#A29BFE] transition-all"
                                    />
                                </div>
                                {billAmount && (
                                    <p className="text-[12px] text-[#6B7280] mt-2">
                                        They'll earn <span className="text-[#16A34A] font-medium">+{Math.round(Number(billAmount) * 0.1)} points</span>
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="flex-1"
                                    onClick={handleClose}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="flex-1"
                                    disabled={!selectedCustomer || !billAmount || loading}
                                    isLoading={loading}
                                >
                                    Save bill
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
