"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, Filter, Search, Calendar, SortAsc, SortDesc, Download, RotateCcw, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import Button from "@/components/ui/Button";

interface Transaction {
    ledgerId: number;
    customerId: string;
    transactionType: string;
    points: number;
    balanceAfter: number;
    billAmount: string | null;
    description: string | null;
    createdAt: string;
    customer?: {
        name: string;
        phoneNumber: string;
    };
}

interface LedgerSummary {
    totalEarned: number;
    totalRedeemed: number;
    totalExpired: number;
    earnCount: number;
    redeemCount: number;
    expiryCount: number;
    totalTransactions: number;
    totalBillAmount: number;
}

interface Filters {
    datePreset: string;
    startDate: string;
    endDate: string;
    type: string[];
    minPoints: string;
    maxPoints: string;
    minBillAmount: string;
    maxBillAmount: string;
    search: string;
    sortBy: string;
    sortOrder: string;
}

const DATE_PRESETS = [
    { value: "", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last7days", label: "Last 7 Days" },
    { value: "last30days", label: "Last 30 Days" },
    { value: "last90days", label: "Last 90 Days" },
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
    { value: "thisYear", label: "This Year" },
    { value: "custom", label: "Custom Range" },
];

const defaultFilters: Filters = {
    datePreset: "",
    startDate: "",
    endDate: "",
    type: [],
    minPoints: "",
    maxPoints: "",
    minBillAmount: "",
    maxBillAmount: "",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
};

export default function BillingPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<Filters>(defaultFilters);
    const [summary, setSummary] = useState<LedgerSummary | null>(null);
    const [totalTransactions, setTotalTransactions] = useState(0);

    const hasActiveFilters = filters.datePreset || filters.type.length > 0 || filters.search ||
        filters.minPoints || filters.maxPoints || filters.minBillAmount || filters.maxBillAmount;

    useEffect(() => {
        fetchTransactions();
    }, [filters]);

    async function fetchTransactions() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("limit", "200");

            if (filters.datePreset) params.set("datePreset", filters.datePreset);
            if (filters.startDate) params.set("startDate", filters.startDate);
            if (filters.endDate) params.set("endDate", filters.endDate);
            if (filters.type.length > 0) params.set("type", filters.type.join(","));
            if (filters.minPoints) params.set("minPoints", filters.minPoints);
            if (filters.maxPoints) params.set("maxPoints", filters.maxPoints);
            if (filters.minBillAmount) params.set("minBillAmount", filters.minBillAmount);
            if (filters.maxBillAmount) params.set("maxBillAmount", filters.maxBillAmount);
            if (filters.search) params.set("search", filters.search);
            params.set("sortBy", filters.sortBy);
            params.set("sortOrder", filters.sortOrder);

            const res = await fetch(`/api/transactions/ledger?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setTransactions(data.transactions);
                setSummary(data.summary);
                setTotalTransactions(data.total);
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    }

    function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
        setFilters(prev => ({ ...prev, [key]: value }));
    }

    function toggleTypeFilter(type: string) {
        setFilters(prev => ({
            ...prev,
            type: prev.type.includes(type)
                ? prev.type.filter(t => t !== type)
                : [...prev.type, type]
        }));
    }

    function resetFilters() {
        setFilters(defaultFilters);
    }

    function toggleSort(field: string) {
        if (filters.sortBy === field) {
            updateFilter("sortOrder", filters.sortOrder === "desc" ? "asc" : "desc");
        } else {
            setFilters(prev => ({ ...prev, sortBy: field, sortOrder: "desc" }));
        }
    }

    function exportCSV() {
        if (transactions.length === 0) return;

        const headers = ["Date", "Time", "Customer", "Phone", "Type", "Description", "Bill Amount", "Points", "Balance"];
        const rows = transactions.map(tx => {
            const date = new Date(tx.createdAt);
            return [
                date.toLocaleDateString("en-IN"),
                date.toLocaleTimeString("en-IN"),
                tx.customer?.name || "",
                tx.customer?.phoneNumber || "",
                tx.transactionType,
                tx.description || "",
                tx.billAmount || "",
                tx.points.toString(),
                tx.balanceAfter.toString(),
            ].join(",");
        });

        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <main className="min-h-screen p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h1 className="text-3xl font-bold text-slate-900 mb-1">Bills</h1>
                <p className="text-slate-500">Complete transaction ledger for all customers</p>
            </motion.div>

            {/* Summary Cards */}
            {summary && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
                >
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Earned</p>
                        <p className="text-2xl font-bold text-emerald-500">+{summary.totalEarned.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">{summary.earnCount} transactions</p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Redeemed</p>
                        <p className="text-2xl font-bold text-violet-500">-{summary.totalRedeemed.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">{summary.redeemCount} transactions</p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Revenue</p>
                        <p className="text-2xl font-bold text-slate-900">₹{summary.totalBillAmount.toLocaleString("en-IN")}</p>
                        <p className="text-xs text-slate-400">from bills</p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Expired</p>
                        <p className="text-2xl font-bold text-amber-500">-{summary.totalExpired.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">{summary.expiryCount} expirations</p>
                    </div>
                </motion.div>
            )}

            {/* Toolbar */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-between mb-4"
            >
                <p className="text-sm text-slate-600">
                    {totalTransactions} transactions {hasActiveFilters && "(filtered)"}
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant={showFilters ? "violet" : "outline"}
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="gap-1"
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                        {hasActiveFilters && (
                            <span className="ml-1 bg-violet-200 text-violet-700 text-xs px-1.5 rounded-full">
                                {[filters.datePreset, filters.type.length > 0, filters.search, filters.minPoints, filters.maxPoints].filter(Boolean).length}
                            </span>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportCSV}
                        disabled={transactions.length === 0}
                        className="gap-1"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </Button>
                </div>
            </motion.div>

            {/* Filter Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 overflow-hidden"
                    >
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-medium text-slate-700">Filter Transactions</h4>
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={resetFilters}
                                        className="text-slate-500 hover:text-slate-700 gap-1"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        Reset
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Date Filter */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                        <Calendar className="w-3 h-3 inline mr-1" />
                                        Date Range
                                    </label>
                                    <select
                                        value={filters.datePreset}
                                        onChange={(e) => updateFilter("datePreset", e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                                    >
                                        {DATE_PRESETS.map(preset => (
                                            <option key={preset.value} value={preset.value}>{preset.label}</option>
                                        ))}
                                    </select>
                                    {filters.datePreset === "custom" && (
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <input
                                                type="date"
                                                value={filters.startDate}
                                                onChange={(e) => updateFilter("startDate", e.target.value)}
                                                className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                                            />
                                            <input
                                                type="date"
                                                value={filters.endDate}
                                                onChange={(e) => updateFilter("endDate", e.target.value)}
                                                className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Transaction Type */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                        Type
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {["EARN", "REDEEM", "EXPIRY"].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => toggleTypeFilter(type)}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                                                    filters.type.includes(type)
                                                        ? type === "EARN" ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300"
                                                        : type === "REDEEM" ? "bg-violet-100 text-violet-700 ring-1 ring-violet-300"
                                                        : "bg-amber-100 text-amber-700 ring-1 ring-amber-300"
                                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Points Range */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                        Points Range
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.minPoints}
                                            onChange={(e) => updateFilter("minPoints", e.target.value)}
                                            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.maxPoints}
                                            onChange={(e) => updateFilter("maxPoints", e.target.value)}
                                            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Bill Amount Range */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                        Bill Amount (₹)
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.minBillAmount}
                                            onChange={(e) => updateFilter("minBillAmount", e.target.value)}
                                            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.maxBillAmount}
                                            onChange={(e) => updateFilter("maxBillAmount", e.target.value)}
                                            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="mt-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search in description..."
                                        value={filters.search}
                                        onChange={(e) => updateFilter("search", e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Transaction Table */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
            >
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-2xl p-12 shadow-[0_6px_18px_rgba(0,0,0,0.08)] text-center">
                        <div className="bg-slate-50 p-4 rounded-full inline-block mb-4">
                            <Receipt className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 text-lg">No transactions found</p>
                        <p className="text-sm text-slate-400 mt-1">
                            {hasActiveFilters ? "Try adjusting your filters" : "Transactions will appear here after billing"}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.08)] overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50/80 border-b border-slate-100">
                            <button
                                onClick={() => toggleSort("createdAt")}
                                className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 hover:text-slate-700 transition-colors text-left"
                            >
                                Date
                                {filters.sortBy === "createdAt" && (
                                    filters.sortOrder === "desc" ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
                                )}
                            </button>
                            <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</div>
                            <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</div>
                            <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</div>
                            <button
                                onClick={() => toggleSort("billAmount")}
                                className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-end gap-1 hover:text-slate-700 transition-colors"
                            >
                                Bill
                                {filters.sortBy === "billAmount" && (
                                    filters.sortOrder === "desc" ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
                                )}
                            </button>
                            <button
                                onClick={() => toggleSort("points")}
                                className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-end gap-1 hover:text-slate-700 transition-colors"
                            >
                                Points
                                {filters.sortBy === "points" && (
                                    filters.sortOrder === "desc" ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
                                )}
                            </button>
                        </div>

                        {/* Transaction Rows */}
                        <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                            {transactions.map((tx, index) => {
                                const isEarn = tx.transactionType === "EARN";
                                const isRedeem = tx.transactionType === "REDEEM";
                                const isExpiry = tx.transactionType === "EXPIRY";
                                const date = new Date(tx.createdAt);

                                return (
                                    <motion.div
                                        key={tx.ledgerId}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors"
                                    >
                                        {/* Date */}
                                        <div className="col-span-2">
                                            <p className="text-sm text-slate-900">
                                                {date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </div>

                                        {/* Customer */}
                                        <div className="col-span-2">
                                            <p className="text-sm font-medium text-slate-900 truncate">{tx.customer?.name || "—"}</p>
                                            <p className="text-xs text-slate-400">{tx.customer?.phoneNumber || ""}</p>
                                        </div>

                                        {/* Type */}
                                        <div className="col-span-2 flex items-center gap-2">
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                                isEarn ? "bg-emerald-50" : isRedeem ? "bg-violet-50" : "bg-amber-50"
                                            }`}>
                                                {isEarn ? (
                                                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                                                ) : isRedeem ? (
                                                    <ArrowDownLeft className="w-4 h-4 text-violet-500" />
                                                ) : (
                                                    <Clock className="w-4 h-4 text-amber-500" />
                                                )}
                                            </div>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                isEarn ? "bg-emerald-100 text-emerald-700" :
                                                isRedeem ? "bg-violet-100 text-violet-700" :
                                                "bg-amber-100 text-amber-700"
                                            }`}>
                                                {tx.transactionType}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        <div className="col-span-2 flex items-center">
                                            <p className="text-sm text-slate-600 truncate">
                                                {tx.description || (isEarn ? "Points earned" : isRedeem ? "Points redeemed" : "Points expired")}
                                            </p>
                                        </div>

                                        {/* Bill Amount */}
                                        <div className="col-span-2 flex items-center justify-end">
                                            {tx.billAmount ? (
                                                <span className="text-sm font-medium text-slate-900">
                                                    ₹{parseFloat(tx.billAmount).toLocaleString("en-IN")}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-slate-300">—</span>
                                            )}
                                        </div>

                                        {/* Points */}
                                        <div className="col-span-2 flex items-center justify-end">
                                            <span className={`text-sm font-bold ${
                                                tx.points > 0 ? "text-emerald-500" : "text-red-500"
                                            }`}>
                                                {tx.points > 0 ? "+" : ""}{tx.points}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </motion.div>
        </main>
    );
}
