"use client";

import { clsx } from "clsx";
import { motion, HTMLMotionProps } from "framer-motion";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "white";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

export default function Button({
    children,
    className,
    variant = "primary",
    size = "md",
    isLoading = false,
    disabled,
    ...props
}: ButtonProps) {
    // 12px border radius as per design system
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        // Primary - Brand purple
        primary: "bg-[#6C5CE7] text-white hover:bg-[#5B4ED6] focus:ring-[#6C5CE7] shadow-md",
        // Secondary - Positive green
        secondary: "bg-[#16A34A] text-white hover:bg-[#15803D] focus:ring-[#16A34A] shadow-md",
        // Outline - Hairline border
        outline: "border border-[rgba(0,0,0,0.06)] bg-transparent text-[#1F2937] hover:bg-[rgba(0,0,0,0.03)] focus:ring-[#6C5CE7]",
        // Ghost - No background
        ghost: "bg-transparent text-[#6B7280] hover:bg-[rgba(0,0,0,0.03)] hover:text-[#1F2937] focus:ring-[#6C5CE7]",
        // Danger - Warning/destructive
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md",
        // White - Surface color
        white: "bg-white text-[#1F2937] hover:bg-[#FAFAFA] border border-[rgba(0,0,0,0.06)] shadow-sm focus:ring-[#6C5CE7]",
    };

    const sizes = {
        sm: "h-8 px-3 text-[12px] rounded-[10px]",
        md: "h-10 px-4 py-2 text-[13px] rounded-[12px]",
        lg: "h-11 px-5 text-[14px] rounded-[12px]",
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            className={clsx(baseStyles, variants[variant as keyof typeof variants], sizes[size], className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Working...</span>
                </span>
            ) : (
                children
            )}
        </motion.button>
    );
}
