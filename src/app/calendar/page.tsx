'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { useEventStore } from '@/store/useEventStore';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { EventModal } from '@/components/EventModal';
import { DeadlineEvent } from '@/types';
import { getEffectivePriority } from '@/utils/priority';
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalIcon, Plus } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, isToday
} from 'date-fns';
import { cn } from '@/utils/cn';

const P_COLOR: Record<string, string> = {
  high:   '#F43F5E',
  medium: '#F59E0B',
  low:    '#10B981',
  auto:   '#6366F1',
};

export default function CalendarPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUserStore();
  const { events } = useEventStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editEvent,   setEditEvent]   = useState<DeadlineEvent | null>(null);
  const [curr,        setCurr]        = useState(new Date());
  const [dir,         setDir]         = useState(0);

  useEffect(() => { if (!authLoading && !user) router.replace('/login'); }, [user, authLoading, router]);

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#030303]">
      <Loader2 size={32} className="animate-spin text-indigo-500" />
    </div>
  );
  if (!user) return null;

  const onPrev = () => { setDir(-1); setCurr(subMonths(curr, 1)); };
  const onNext = () => { setDir(1);  setCurr(addMonths(curr, 1)); };

  const startM = startOfMonth(curr);
  const endM   = endOfMonth(startM);
  const days: Date[] = [];
  let d = startOfWeek(startM);
  while (d <= endOfWeek(endM)) {
    days.push(d);
    d = addDays(d, 1);
  }

  const getEventsForDay = (day: Date) =>
    events.filter(e => {
      const ed = e.deadline instanceof Timestamp ? e.deadline.toDate() : new Date(e.deadline as string);
      return isSameDay(ed, day);
    });

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#030303] text-white">
      <Navbar onMenuToggle={() => setSidebarOpen(s => !s)} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onCreateEvent={() => { setEditEvent(null); setModalOpen(true); }} />

        {/* Background Accents */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-500/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-purple-500/10 blur-[100px] rounded-full" />
        </div>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 no-sb z-10">
          <div className="max-w-[1400px] mx-auto space-y-8">
            
            {/* Calendar Controls */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
              <div>
                <div className="flex items-center gap-2 mb-2 text-indigo-400">
                  <CalIcon size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Temporal View</span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight">{format(curr, 'MMMM yyyy')}</h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 p-1 glass rounded-2xl border-white/5 shadow-inner">
                  <button onClick={onPrev} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-zinc-400 hover:text-white">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={() => setCurr(new Date())} className="px-5 py-2 text-xs font-bold hover:bg-white/5 rounded-xl transition-colors">
                    Today
                  </button>
                  <button onClick={onNext} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-zinc-400 hover:text-white">
                    <ChevronRight size={20} />
                  </button>
                </div>
                <button onClick={() => { setEditEvent(null); setModalOpen(true); }} className="px-6 py-3 rounded-2xl grad-accent text-sm font-bold shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-all flex items-center gap-2">
                  <Plus size={18} /> Schedule
                </button>
              </div>
            </header>

            {/* Calendar Table */}
            <div className="glass-hi rounded-[32px] overflow-hidden border-white/10 shadow-2xl flex flex-col">
              {/* Table Header */}
              <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.02]">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-5 text-center text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Table Grid */}
              <div className="grid grid-cols-7 flex-1 min-h-[600px]">
                <AnimatePresence mode="wait">
                  {days.map((day, i) => {
                    const dayEvents = getEventsForDay(day);
                    const notCurrentM = !isSameMonth(day, startM);
                    const isTodayDay = isToday(day);

                    return (
                      <div
                        key={i}
                        className={cn(
                          "relative min-h-[120px] p-3 border-r border-b border-white/[0.04] transition-colors group",
                          notCurrentM ? "bg-black/20 opacity-30" : "hover:bg-white/[0.02]",
                          isTodayDay && "bg-indigo-500/[0.03]"
                        )}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className={cn(
                            "w-8 h-8 flex items-center justify-center text-sm font-bold rounded-xl transition-all",
                            isTodayDay ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" : "text-zinc-500 group-hover:text-zinc-300"
                          )}>
                            {format(day, 'd')}
                          </span>
                        </div>

                        <div className="space-y-1.5 overflow-hidden">
                          {dayEvents.slice(0, 4).map(e => {
                            const p = getEffectivePriority(e);
                            const col = P_COLOR[p] || P_COLOR.auto;
                            const isDone = e.status === 'completed';

                            return (
                              <button
                                key={e.id}
                                onClick={() => { setEditEvent(e); setModalOpen(true); }}
                                className={cn(
                                  "w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] font-bold truncate transition-all flex items-center gap-2 border border-transparent shadow-sm",
                                  isDone 
                                    ? "bg-white/5 text-zinc-600 line-through grayscale" 
                                    : "bg-white/[0.04] text-zinc-200 border-white/[0.03] hover:border-white/10 hover:bg-white/[0.08]"
                                )}
                              >
                                {!isDone && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: col, boxShadow: `0 0 8px ${col}40` }} />}
                                {e.title}
                              </button>
                            );
                          })}
                          {dayEvents.length > 4 && (
                            <p className="text-[10px] font-bold text-zinc-600 px-2">+ {dayEvents.length - 4} more</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {modalOpen && <EventModal event={editEvent} onClose={() => { setModalOpen(false); setEditEvent(null); }} />}
      </AnimatePresence>
    </div>
  );
}
