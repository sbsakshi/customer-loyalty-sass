"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RefreshCw, Plus, Phone, Gift, ArrowRight, X, Coins } from "lucide-react";
import Button from "@/components/ui/Button";
import AddCustomerModal from "@/components/AddCustomerModal";

// Helper function to get initials from name
function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

// Helper function to get gradient color based on name
function getAvatarGradient(name: string): string {
    const gradients = [
        "from-violet-500 to-purple-600",
        "from-blue-500 to-indigo-600",
        "from-emerald-500 to-teal-600",
        "from-orange-500 to-red-500",
        "from-pink-500 to-rose-600",
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
}

export default function CustomersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch] = useDebounce(searchTerm, 500);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [redeemPoints, setRedeemPoints] = useState("");
    const [redeemDescription, setRedeemDescription] = useState("");
    const [redeeming, setRedeeming] = useState(false);
    const router = useRouter();

    const fetchCustomers = async (search = "") => {
        setLoading(true);
        try {
            const res = await fetch(`/api/customers?search=${search}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setCustomers(data);
            }
        } catch (error) {
            console.error("Failed to fetch", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers(debouncedSearch);
    }, [debouncedSearch]);

    async function handleRedeem() {
        if (!selectedCustomer || !redeemPoints) return;

        const points = parseInt(redeemPoints);
        if (points <= 0 || points > selectedCustomer.totalPoints) {
            alert("Invalid points amount");
            return;
        }

        setRedeeming(true);
        try {
            const res = await fetch("/api/transactions/redeem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerId: selectedCustomer.customerId,
                    pointsToRedeem: points,
                    description: redeemDescription || "Points redeemed",
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.error || "Failed to redeem points");
                return;
            }

            // Update local state
            setCustomers(prev => prev.map(c =>
                c.customerId === selectedCustomer.customerId
                    ? { ...c, totalPoints: c.totalPoints - points }
                    : c
            ));
            setSelectedCustomer((prev: any) => ({ ...prev, totalPoints: prev.totalPoints - points }));
            setRedeemPoints("");
            setRedeemDescription("");
            alert("Points redeemed successfully!");
        } catch (error) {
            console.error(error);
            alert("Error redeeming points");
        } finally {
            setRedeeming(false);
        }
    }

    function closeDetails() {
        setSelectedCustomer(null);
        setRedeemPoints("");
        setRedeemDescription("");
    }

    return (
        <main className="min-h-screen p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-1">Customers</h1>
                    <p className="text-slate-500">Manage your loyalty program members</p>
                </div>
                <Button
                    variant="violet"
                    onClick={() => setShowRegister(true)}
                    className="gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Customer
                </Button>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8">
                <div className="flex items-center px-4">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        className="flex-1 px-4 py-4 bg-transparent border-none text-slate-900 placeholder:text-slate-400 outline-none text-base"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {loading && (
                        <RefreshCw className="w-5 h-5 text-violet-500 animate-spin" />
                    )}
                </div>
            </div>

            {/* Customer List */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {customers.map((customer, index) => (
                        <motion.div
                            key={customer.customerId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => setSelectedCustomer(customer)}
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-lg hover:border-slate-200 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarGradient(customer.name)} flex items-center justify-center flex-shrink-0`}>
                                        <span className="text-white font-bold text-sm">
                                            {getInitials(customer.name)}
                                        </span>
                                    </div>

                                    {/* Name & Phone */}
                                    <div>
                                        <h3 className="font-semibold text-slate-900 text-lg">
                                            {customer.name}
                                        </h3>
                                        <div className="flex items-center gap-1 text-slate-500 text-sm">
                                            <Phone className="w-3 h-3" />
                                            +91 {customer.phoneNumber?.replace(/(\d{5})(\d{5})/, '$1 $2')}
                                        </div>
                                    </div>
                                </div>

                                {/* Arrow indicator */}
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-violet-500 transition-colors" />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {!loading && customers.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-1">No customers found</h3>
                    <p className="text-slate-500">Try adjusting your search or add a new customer</p>
                </div>
            )}

            {/* Customer Details Modal */}
            <AnimatePresence>
                {selectedCustomer && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                            onClick={closeDetails}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-slate-100">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getAvatarGradient(selectedCustomer.name)} flex items-center justify-center`}>
                                            <span className="text-white font-bold text-lg">
                                                {getInitials(selectedCustomer.name)}
                                            </span>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">{selectedCustomer.name}</h2>
                                            <p className="text-slate-500 flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                +91 {selectedCustomer.phoneNumber?.replace(/(\d{5})(\d{5})/, '$1 $2')}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={closeDetails}
                                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Points Display */}
                            <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50">
                                <div className="text-center">
                                    <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-3">
                                        <Coins className="w-5 h-5 text-violet-500" />
                                        <span className="text-sm font-medium text-slate-600">Available Points</span>
                                    </div>
                                    <p className="text-5xl font-bold text-violet-600">
                                        {selectedCustomer.totalPoints.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-2">
                                        Worth ₹{(selectedCustomer.totalPoints).toLocaleString()} in discounts
                                    </p>
                                </div>
                            </div>

                            {/* Redeem Section */}
                            <div className="p-6">
                                <h3 className="text-sm font-medium text-slate-700 mb-4 flex items-center gap-2">
                                    <Gift className="w-4 h-4 text-violet-500" />
                                    Redeem Points
                                </h3>

                                {selectedCustomer.totalPoints > 0 ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                                Points to Redeem
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={redeemPoints}
                                                    onChange={(e) => setRedeemPoints(e.target.value)}
                                                    min="1"
                                                    max={selectedCustomer.totalPoints}
                                                    placeholder="0"
                                                    className="w-full px-4 py-3 text-2xl font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
                                                />
                                                <button
                                                    onClick={() => setRedeemPoints(selectedCustomer.totalPoints.toString())}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-violet-600 hover:text-violet-700 bg-violet-100 px-2 py-1 rounded-md"
                                                >
                                                    MAX
                                                </button>
                                            </div>
                                            {redeemPoints && (
                                                <p className="text-sm text-slate-500 mt-1">
                                                    Discount: ₹{parseInt(redeemPoints || "0").toLocaleString()}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                                Note (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={redeemDescription}
                                                onChange={(e) => setRedeemDescription(e.target.value)}
                                                placeholder="e.g., Bill #12345"
                                                className="w-full px-4 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                                            />
                                        </div>

                                        <Button
                                            variant="violet"
                                            className="w-full h-12"
                                            onClick={handleRedeem}
                                            disabled={!redeemPoints || parseInt(redeemPoints) <= 0 || parseInt(redeemPoints) > selectedCustomer.totalPoints || redeeming}
                                            isLoading={redeeming}
                                        >
                                            <Gift className="w-4 h-4 mr-2" />
                                            Redeem {redeemPoints ? parseInt(redeemPoints).toLocaleString() : 0} Points
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 bg-slate-50 rounded-xl">
                                        <p className="text-slate-500">No points available to redeem</p>
                                        <p className="text-xs text-slate-400 mt-1">Points are earned on purchases</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Add Customer Modal */}
            <AddCustomerModal
                isOpen={showRegister}
                onClose={() => setShowRegister(false)}
            />
        </main>
    );
}
