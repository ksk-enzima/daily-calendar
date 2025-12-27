'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { DailyCardMeta } from '@/lib/storage'; // Type only

interface CardViewProps {
    card: DailyCardMeta | null; // null means loading or placeholder
    isLoading?: boolean;
    isHolo?: boolean;
    label?: string; // "Just Joined" / "Yesterday" etc
}

export function CardView({ card, isLoading, isHolo, label }: CardViewProps) {
    if (isLoading) {
        return (
            <div className="w-[300px] h-[500px] bg-slate-200 rounded-lg animate-pulse flex items-center justify-center shadow-md">
                <span className="text-slate-400 font-bold">準備中...</span>
            </div>
        );
    }

    if (!card) {
        return (
            <div className="w-[300px] h-[500px] bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                <span className="text-slate-400">データがありません</span>
            </div>
        );
    }

    return (
        <div className={`relative w-[300px] h-[525px] sm:w-[360px] sm:h-[630px] rounded-sm shadow-xl overflow-hidden bg-white border border-slate-100 ${isHolo ? 'ring-4 ring-yellow-300' : ''}`}>
            {/* Holo Effect Container */}
            {isHolo && (
                <div className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay bg-gradient-holo opacity-50" />
            )}

            {/* Image */}
            {/* We use unoptimized for local fs images usually, or normal Image if configured */}
            <div className="relative w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={(() => {
                        const rawPath = (card as any).imageUrl || card.image_path.replace(/^.*public/, '');
                        return rawPath.startsWith('/app/calendar') ? rawPath : `/app/calendar${rawPath.startsWith('/') ? '' : '/'}${rawPath}`;
                    })()}
                    alt={card.model}
                    className="w-full h-full object-cover"
                />
            </div>

            {label && (
                <div className="absolute top-2 left-2 z-30 bg-black/50 text-white px-2 py-1 rounded text-xs">
                    {label}
                </div>
            )}
        </div>
    );
}
