"use client";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
    noHover?: boolean;
}

export default function Card({ children, className, noPadding = false, noHover = false }: CardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={twMerge(
                clsx(
                    "bg-[#FFFFFF] rounded-[14px] overflow-hidden",
                    "shadow-[0px_12px_24px_rgba(0,0,0,0.04)]",
                    "transition-all duration-150",
                    !noHover && "hover:-translate-y-0.5 hover:shadow-[0px_12px_24px_rgba(0,0,0,0.06)]",
                    !noPadding && "p-5",
                    className
                )
            )}
        >
            {children}
        </motion.div>
    );
}
