"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, Phone, Hash, Award, RefreshCw, Plus } from "lucide-react";
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
                        placeholder="Search by name, phone, or email..."
                        className="flex-1 px-4 py-4 bg-transparent border-none text-slate-900 placeholder:text-slate-400 outline-none text-base"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {loading && (
                        <RefreshCw className="w-5 h-5 text-violet-500 animate-spin" />
                    )}
                </div>
            </div>

            {/* Customer Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                    {customers.map((customer, index) => (
                        <motion.div
                            key={customer.customerId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-lg hover:border-slate-200 transition-all cursor-pointer"
                        >
                            {/* Avatar */}
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarGradient(customer.name)} flex items-center justify-center mb-4`}>
                                <span className="text-white font-bold text-sm">
                                    {getInitials(customer.name)}
                                </span>
                            </div>

                            {/* Name & Phone */}
                            <h3 className="font-semibold text-slate-900 text-lg mb-1">
                                {customer.name}
                            </h3>
                            <p className="text-slate-500 text-sm mb-4">
                                +91 {customer.phoneNumber?.replace(/(\d{5})(\d{5})/, '$1 $2')}
                            </p>

                            {/* Divider */}
                            <div className="border-t border-slate-100 my-4" />

                            {/* Points & Spent */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wide">Points</p>
                                    <p className="text-2xl font-bold text-violet-600">
                                        {customer.totalPoints}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 uppercase tracking-wide">Spent</p>
                                    <p className="text-lg font-semibold text-slate-700">
                                        {/* TODO: Spent amount not available in current data model */}
                                        ₹{(customer.totalPoints * 10).toLocaleString()}
                                    </p>
                                </div>
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

            {/* Add Customer Modal */}
            <AddCustomerModal
                isOpen={showRegister}
                onClose={() => setShowRegister(false)}
            />
        </main>
    );
}
