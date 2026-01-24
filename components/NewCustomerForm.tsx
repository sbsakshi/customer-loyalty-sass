"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCustomerForm() {
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
            alert(`Customer Created! Membership ID: ${data.customerId}`);
            setName("");
            setPhone("");
            setAddress("");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Error creating customer");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4 text-slate-800">New Customer</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Name</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2 text-slate-900"
                        placeholder="John Doe"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Phone Number (10 Digits)</label>
                    <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2 text-slate-900"
                        placeholder="9876543210"
                        maxLength={10}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Address</label>
                    <textarea
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2 text-slate-900"
                        placeholder="Full Address"
                        rows={3}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Create Membership"}
                </button>
            </form>
        </div>
    );
}
