import Link from 'next/link';
import { getMetaStore } from '@/lib/storage';
import dayjs from 'dayjs';
import clsx from 'clsx';
import { getTodayJST } from '@/lib/date-utils';

interface GalleryPageProps {
    searchParams: Promise<{ month?: string }>;
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
    const params = await searchParams;
    const today = getTodayJST();
    const currentMonthStr = params.month || dayjs(today).format('YYYY-MM');
    const currentMonth = dayjs(currentMonthStr + '-01');

    const metaStore = await getMetaStore();

    // Generate days for the month
    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');
    const daysInMonth = endOfMonth.date();

    const days = [];
    // Simple padding for start of week (Sunday start)
    const startDayOfWeek = startOfMonth.day();

    for (let i = 0; i < startDayOfWeek; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(currentMonth.date(i).format('YYYY-MM-DD'));
    }

    // Navigation
    const prevMonth = currentMonth.subtract(1, 'month').format('YYYY-MM');
    const nextMonth = currentMonth.add(1, 'month').format('YYYY-MM');

    return (
        <div className="min-h-screen bg-neutral-50 p-4">
            <header className="flex items-center justify-between mb-8 max-w-4xl mx-auto">
                <Link href="/" className="text-blue-500 hover:underline">
                    ← Back to Home
                </Link>
                <h1 className="text-2xl font-bold">{currentMonth.format('YYYY年 M月')}</h1>
                <div className="space-x-4">
                    <Link href={`/gallery?month=${prevMonth}`} className="px-3 py-1 bg-white rounded border hover:bg-neutral-100">
                        &lt; 前月
                    </Link>
                    <Link href={`/gallery?month=${nextMonth}`} className="px-3 py-1 bg-white rounded border hover:bg-neutral-100">
                        次月 &gt;
                    </Link>
                </div>
            </header>

            <div className="max-w-4xl mx-auto grid grid-cols-7 gap-2 sm:gap-4">
                {['日', '月', '火', '水', '木', '金', '土'].map((d) => (
                    <div key={d} className="text-center font-bold text-slate-400 py-2">
                        {d}
                    </div>
                ))}

                {days.map((date, idx) => {
                    if (!date) return <div key={`empty-${idx}`} className="bg-transparent aspect-[2/3]" />;

                    const meta = metaStore[date];
                    const isToday = date === today;
                    // Determine if we should show it?
                    // Show if meta exists. If not, show empty placeholder or number.

                    return (
                        <div key={date} className={clsx(
                            "relative aspect-[2/3] rounded-lg border flex flex-col items-center justify-start overflow-hidden bg-white hover:shadow-lg transition-shadow",
                            isToday && "ring-2 ring-blue-500"
                        )}>
                            <div className="absolute top-1 left-2 z-10 text-xs font-bold text-slate-500 bg-white/80 px-1 rounded">
                                {dayjs(date).format('D')}
                            </div>

                            {meta ? (
                                <Link href={`/?date=${date}`} className="w-full h-full block group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={meta.image_path.replace(/^.*public/, '')} alt={meta.model} className="w-full h-full object-cover" />
                                    {meta.is_holo && (
                                        <div className="absolute inset-0 bg-gradient-holo opacity-30 pointer-events-none" />
                                    )}
                                    <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 text-[10px] text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                        {meta.maker} {meta.model}
                                    </div>
                                </Link>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-200">
                                    <span className="text-2xl">?</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
