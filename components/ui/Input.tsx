"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={clsx(
                        "w-full rounded-lg border bg-white/50 px-4 py-2 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                        error
                            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                            : "border-slate-200 focus:border-orange-500 focus:ring-orange-200 hover:border-orange-300",
                        className
                    )}
                    {...props}
                />
                {error && <p className="mt-1 text-xs text-red-500 ml-1">{error}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
