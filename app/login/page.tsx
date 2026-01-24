"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                router.push("/");
                router.refresh();
            } else {
                setError("Invalid credentials. Please try again.");
            }
        } catch (err) {
            setError("Something went wrong. Please check connection.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex w-full bg-orange-50">
            {/* Left Side: Image / Spiritual Theme */}
            <div className="hidden lg:flex w-1/2 relative bg-orange-900 items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-600/20 to-black/60 z-10" />
                <Image
                    src="/mahadev.png"
                    layout="fill"
                    objectFit="cover"
                    alt="Mahadev Silhouette"
                    className="opacity-90"
                    priority
                />
                <div className="relative z-20 text-center p-12">
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-100 to-amber-200 mb-6 drop-shadow-lg">
                        Shubh Aarambh
                    </h1>
                    <p className="text-orange-100 text-lg max-w-md mx-auto leading-relaxed">
                        "Begin your journey with grace and prosperity."
                    </p>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-md space-y-8 bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-orange-500/10 border border-orange-100">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
                        <p className="text-slate-500 mt-2">Please sign in to your dashboard</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2">
                            Alert: {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Username</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-slate-50 text-slate-900 placeholder:text-slate-400"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-slate-50 text-slate-900 placeholder:text-slate-400"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-4">
                        <p className="text-xs text-slate-400">
                            Manbhavan General Store Implementation &copy; 2024
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
