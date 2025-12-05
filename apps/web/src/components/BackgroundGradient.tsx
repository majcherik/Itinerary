'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function BackgroundGradient() {
    const [gradient, setGradient] = useState('');

    useEffect(() => {
        const updateGradient = () => {
            const hour = new Date().getHours();

            // Dawn (5am - 8am): Soft Pink -> Light Orange
            if (hour >= 5 && hour < 8) {
                setGradient('linear-gradient(to bottom, #ffecd2 0%, #fcb69f 100%)');
            }
            // Day (8am - 5pm): Light Blue -> Cream
            else if (hour >= 8 && hour < 17) {
                setGradient('linear-gradient(to bottom, #e0c3fc 0%, #8ec5fc 100%)'); // Placeholder for now, maybe too blue?
                // Let's stick to the warm theme:
                setGradient('linear-gradient(to bottom, #fff9f5 0%, #fff0e6 100%)');
            }
            // Golden Hour / Sunset (5pm - 8pm): Pink -> Orange -> Purple
            else if (hour >= 17 && hour < 20) {
                setGradient('linear-gradient(to bottom, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)');
            }
            // Night (8pm - 5am): Dark Purple -> Deep Blue
            else {
                setGradient('linear-gradient(to bottom, #2d2438 0%, #1a1a2e 100%)');
            }
        };

        updateGradient();
        const interval = setInterval(updateGradient, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    // For now, let's just use a subtle fixed gradient for the background to be safe and clean
    // The dynamic one can be an overlay or specific hero section.
    // Actually, let's make this a subtle fixed background for the whole app.

    return (
        <div className="fixed inset-0 -z-10 h-full w-full bg-[#fff9f5]">
            <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(224,82,94,0.15),rgba(255,255,255,0))]" />
            <div className="absolute bottom-0 left-0 z-[-2] h-screen w-screen bg-[radial-gradient(ellipse_80%_80%_at_0%_100%,rgba(247,142,72,0.1),rgba(255,255,255,0))]" />
        </div>
    );
}
