'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface ScissorsProps {
    onCut: () => void;
    disabled?: boolean;
}

export function Scissors({ onCut, disabled }: ScissorsProps) {
    const [isCutting, setIsCutting] = useState(false);

    const handleClick = () => {
        if (disabled || isCutting) return;
        setIsCutting(true);
        onCut();
        // Reset state is handled by parent or just stays cut?
        // The parent will likely unmount or hide this, or we just play animation.
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled || isCutting}
            className="group relative flex items-center justify-center p-4 transition-transform active:scale-95 disabled:opacity-50"
            aria-label="めくる (Cut page)"
        >
            <div className="relative w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-slate-200 group-hover:border-blue-400 transition-colors">
                {/* Simple CSS/SVG Scissors Icon */}
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`w-12 h-12 text-slate-700 ${isCutting ? 'animate-pulse' : ''}`}
                >
                    <circle cx="6" cy="6" r="3" />
                    <circle cx="6" cy="18" r="3" />
                    <line x1="20" y1="4" x2="8.12" y2="15.88" />
                    <line x1="14.47" y1="14.48" x2="20" y2="20" />
                    <line x1="8.12" y1="8.12" x2="12" y2="12" />
                </svg>
            </div>
            <span className="absolute -bottom-8 font-bold text-slate-600 bg-white/80 px-2 rounded-full">
                {isCutting ? 'チョキチョキ...' : 'めくる'}
            </span>
        </button>
    );
}
