"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, Phone, Hash, Award, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import NewCustomerForm from "@/components/NewCustomerForm";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";

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

    const columns = [
        {
            header: "Customer",
            accessor: (item: any) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">{item.name}</span>
                    <span className="text-xs text-slate-500">{item.address}</span>
                </div>
            )
        },
        {
            header: "Membership ID",
            accessor: (item: any) => (
                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
                    {item.customerId}
                </span>
            )
        },
        {
            header: "Phone",
            accessor: (item: any) => (
                <div className="flex items-center text-slate-600">
                    <Phone className="w-3 h-3 mr-1" />
                    {item.phoneNumber}
                </div>
            )
        },
        {
            header: "Points",
            accessor: (item: any) => (
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <Award className="w-3 h-3 mr-1" />
                    {item.totalPoints}
                </div>
            )
        },
    ];

    return (
        <main className="min-h-screen pb-20 bg-slate-50/50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Customer Database</h1>
                        <p className="text-slate-500 mt-1">Manage memberships and view loyalty points.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Collapsible New Customer Section */}
                    <div className="bg-white border border-orange-100 rounded-2xl shadow-xl shadow-orange-500/5 overflow-hidden">
                        <div
                            className="p-6 bg-gradient-to-r from-orange-50 to-white flex items-center justify-between cursor-pointer hover:bg-orange-50/50 transition-colors"
                            onClick={() => setShowRegister(!showRegister)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-orange-600 rounded-xl text-white shadow-lg shadow-orange-500/20">
                                    <UserPlus className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Add New Customer</h2>
                                    <p className="text-slate-500 text-sm">Create a loyalty membership card</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-orange-600">
                                {showRegister ? "Close" : "Expand"}
                            </Button>
                        </div>

                        <AnimatePresence>
                            {showRegister && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden border-t border-orange-100"
                                >
                                    <div className="p-6 bg-white">
                                        <NewCustomerForm />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Search Bar */}
                    <Card noPadding className="p-2 flex items-center gap-2 border-slate-200 shadow-sm bg-white">
                        <div className="p-3 text-slate-400">
                            <Search className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by Name, Phone, or Membership ID..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 placeholder:text-slate-400 h-12 outline-none font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {loading && (
                            <div className="p-3 text-orange-500 animate-spin">
                                <RefreshCw className="w-5 h-5" />
                            </div>
                        )}
                    </Card>

                    {/* Data Table */}
                    <div className="relative">
                        <Table
                            data={customers}
                            columns={columns}
                            className="shadow-xl shadow-slate-200/50"
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
