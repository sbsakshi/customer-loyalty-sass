"use client";

import { clsx } from "clsx";
import { motion } from "framer-motion";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

export default function Card({ children, className, noPadding = false }: CardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={clsx(
                "glass-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                !noPadding && "p-6",
                className
            )}
        >
            {children}
        </motion.div>
    );
}
