'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getTodayJST, getYesterdayJST } from '@/lib/date-utils';
import { Scissors } from '@/components/Scissors';
import { CardView } from '@/components/CardView';

// Types
interface CardData {
  imageUrl: string;
  is_holo: boolean;
  maker: string;
  model: string;
  date: string;
}

function HomeContent() {
  const searchParams = useSearchParams();
  const debugDate = searchParams.get('date');

  const [viewState, setViewState] = useState<'loading' | 'yesterday' | 'cutting' | 'today'>('loading');
  const [todayCard, setTodayCard] = useState<CardData | null>(null);
  const [yesterdayCard, setYesterdayCard] = useState<CardData | null>(null);

  // Audio refs
  const tearSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize Audio
    // tearSoundRef.current = new Audio('/sounds/tear.mp3'); 
  }, []);

  useEffect(() => {
    const init = async () => {
      const today = debugDate || getTodayJST();
      const yesterday = debugDate ? '2000-01-01' : getYesterdayJST();

      // Check localStorage
      const peeledKey = `peeled:${today}`;
      const isPeeled = localStorage.getItem(peeledKey) === '1';

      if (isPeeled) {
        // Already peeled, show Today directly
        const data = await fetchCard(today);
        setTodayCard(data);
        setViewState('today');
      } else {
        // Not peeled, show Yesterday (and pre-fetch Today?)
        // Fetch Yesterday
        const yData = await fetchCard(yesterday);
        setYesterdayCard(yData);
        setViewState('yesterday');
      }
    };

    init();
  }, [debugDate]);

  const fetchCard = async (date: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || '/app/calendar'}/api/card?date=${date}`);
      if (!res.ok) return null; // Handle error/generating
      if (res.status === 202) {
        // Generating... could poll, but for now simple fallback
        return null;
      }
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleCut = async () => {
    setViewState('cutting');

    // Play sound
    // if (tearSoundRef.current) tearSoundRef.current.play();

    // Start fetching Today immediately
    const today = debugDate || getTodayJST();

    // Wait for animation (5s) AND fetch
    const [data] = await Promise.all([
      fetchCard(today),
      new Promise((resolve) => setTimeout(resolve, 5000))
    ]);

    setTodayCard(data);

    // Mark as peeled
    localStorage.setItem(`peeled:${today}`, '1');
    setViewState('today');
  };

  if (viewState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 overflow-hidden relative">
      <h1 className="sr-only">Car Daily Calendar</h1>

      {/* Container for Cards */}
      <div className="relative z-10">
        <AnimatePresence mode="popLayout">
          {viewState === 'today' && todayCard && (
            <motion.div
              key="today"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <CardView card={todayCard as any} isHolo={todayCard.is_holo} label="今日" />
              <div className="text-center mt-4">
                <p className="text-2xl font-bold font-sans text-slate-800">{todayCard.maker} {todayCard.model}</p>
              </div>
            </motion.div>
          )}

          {(viewState === 'yesterday' || viewState === 'cutting') && (
            <motion.div
              key="yesterday"
              className="absolute inset-0"
              initial={{ x: 0, opacity: 1 }}
              exit={{ x: -1000, rotate: -10, opacity: 0, transition: { duration: 1 } }}
            >
              <div className="relative">
                <CardView card={yesterdayCard as any} label="昨日" />

                {viewState === 'cutting' && (
                  <motion.div
                    className="absolute inset-0 bg-white/30 backdrop-blur-[2px] z-50 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {/* Tearing Vfx or just cover */}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Placeholder for Yesterday if empty (First ever visit?) */}
        {viewState === 'yesterday' && !yesterdayCard && (
          <div className="w-[300px] h-[525px] bg-slate-200 rounded flex items-center justify-center">
            <p>昨日のカードはありません</p>
          </div>
        )}
      </div>

      {/* Scissors Button */}
      <div className="mt-8 z-20 h-24">
        {(viewState === 'yesterday' || viewState === 'cutting') && (
          <Scissors onCut={handleCut} disabled={viewState === 'cutting'} />
        )}

        {viewState === 'today' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-lg text-slate-500">またあした！</p>
            <a href="/gallery" className="mt-2 inline-block text-blue-500 underline">ギャラリーを見る</a>
          </motion.div>
        )}
      </div>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
