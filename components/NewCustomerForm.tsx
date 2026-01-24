"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Store, Loader2 } from "lucide-react";

interface NewCustomerFormProps {
    onClose?: () => void;
}

export default function NewCustomerForm({ onClose }: NewCustomerFormProps) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // VALIDATION
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

            const data = await res.json();
            // Optional: You could show a specialized success message or toast here
            setName("");
            setPhone("");
            setAddress("");
            router.refresh();
            if (onClose) onClose();
        } catch (error) {
            console.error(error);
            alert("Error creating customer");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-bold text-slate-900 mb-2">Member Details</label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border-slate-200 bg-slate-50 border px-4 py-3 text-slate-900 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition-all outline-none"
                        placeholder="e.g. Rahul Sharma"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-xl border-slate-200 bg-slate-50 border px-4 py-3 text-slate-900 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition-all outline-none"
                        placeholder="e.g. 9876543210"
                        maxLength={10}
                    />
                </div>
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Address <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full rounded-xl border-slate-200 bg-slate-50 border px-4 py-3 text-slate-900 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition-all outline-none resize-none"
                        placeholder="Residential area or locality..."
                        rows={2}
                    />
                </div>

                <div className="col-span-1 md:col-span-2 pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Create Membership"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
