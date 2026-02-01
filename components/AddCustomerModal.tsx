"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";

interface AddCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddCustomerModal({ isOpen, onClose }: AddCustomerModalProps) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!/^\d{10}$/.test(phone)) {
            alert("Phone number must be exactly 10 digits.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phoneNumber: phone, address }),
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.error || "Failed to create customer");
                setLoading(false);
                return;
            }

            setName("");
            setPhone("");
            setAddress("");
            router.refresh();
            onClose();
        } catch (error) {
            console.error(error);
            alert("Error creating customer");
        } finally {
            setLoading(false);
        }
    }

    function handleClose() {
        if (!loading) {
            setName("");
            setPhone("");
            setAddress("");
            onClose();
        }
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
                                <h2 className="text-[17px] font-semibold text-[#1F2937]">Add customer</h2>
                                <p className="text-[13px] text-[#6B7280]">Welcome someone new to your store</p>
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
                            <div>
                                <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                                    Their name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Full name"
                                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-[rgba(0,0,0,0.06)] rounded-[12px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#A29BFE] transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                                    Phone number
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] text-[14px]">+91</span>
                                    <input
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="98765 43210"
                                        maxLength={10}
                                        className="w-full pl-12 pr-4 py-3 bg-[#FAFAFA] border border-[rgba(0,0,0,0.06)] rounded-[12px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#A29BFE] transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                                    Address <span className="text-[#9CA3AF] font-normal">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Street, City, State"
                                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-[rgba(0,0,0,0.06)] rounded-[12px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#A29BFE] transition-all"
                                />
                            </div>

                            {/* Info Box */}
                            <div className="bg-[#F6F5FF] border border-[rgba(108,92,231,0.15)] rounded-[12px] p-4">
                                <p className="text-[13px] text-[#6B7280]">
                                    They'll start fresh and earn points on their first visit.
                                </p>
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
                                    isLoading={loading}
                                >
                                    Add customer
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
