"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

interface CustomerSearchProps {
    onSelect?: (customer: any) => void;
    placeholder?: string;
}

export default function CustomerSearch({ onSelect, placeholder }: CustomerSearchProps) {
    const [query, setQuery] = useState("");
    const [debouncedQuery] = useDebounce(query, 500);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!debouncedQuery) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        async function search() {
            setLoading(true);
            try {
                const res = await fetch(`/api/customers?search=${encodeURIComponent(debouncedQuery)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                    setIsOpen(true);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        search();
    }, [debouncedQuery]);

    return (
        <div className="relative w-full">
            <div className="relative">
                <Input
                    type="text"
                    placeholder={placeholder || "Search by Phone, Name, or ID..."}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 h-12 text-lg"
                />
                <div className="absolute left-3 top-3.5 text-slate-400">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                </div>
            </div>

            <AnimatePresence>
                {isOpen && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute z-50 w-full mt-2"
                    >
                        <Card noPadding className="max-h-80 overflow-y-auto border-orange-100 shadow-xl">
                            {results.map((c: any) => (
                                <div
                                    key={c.customerId}
                                    className="p-4 hover:bg-orange-50 cursor-pointer border-b border-orange-50/50 last:border-none transition-colors group"
                                    onClick={() => {
                                        onSelect && onSelect(c);
                                        setQuery("");
                                        setResults([]);
                                        setIsOpen(false);
                                    }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                                                {c.name}
                                            </div>
                                            <div className="text-sm text-slate-500">{c.phoneNumber}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded">
                                                {c.customerId}
                                            </div>
                                            <div className="text-xs text-emerald-600 font-medium mt-1">
                                                {c.totalPoints} pts
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
