import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface GlassAuthCardProps {
    children: React.ReactNode;
    title: string;
    description: string;
}

/**
 * GlassAuthCard - Glass morphism card wrapper for authentication forms
 * Features backdrop blur, subtle border, and smooth animations
 */
export const GlassAuthCard: React.FC<GlassAuthCardProps> = ({
    children,
    title,
    description
}) => {
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md"
        >
            <div className="rounded-3xl overflow-hidden border border-border/60 bg-card/85 backdrop-blur-xl shadow-2xl">
                <div className="p-8 sm:p-10">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold tracking-tight mb-2">
                            {title}
                        </h2>
                        <p className="text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </motion.div>
    );
};
