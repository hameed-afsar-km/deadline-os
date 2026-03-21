'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { useEventStore } from '@/store/useEventStore';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { EventModal } from '@/components/EventModal';
import { DeadlineEvent } from '@/types';
import { getEffectivePriority, isOverdue } from '@/utils/priority';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
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
  auto:   '#A78BFA',
};

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (d: number) => ({ x: d < 0 ? 40 : -40, opacity: 0 }),
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
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-violet-400" />
    </div>
  );
  if (!user) return null;

  const onPrev = () => { setDir(-1); setCurr(subMonths(curr, 1)); };
  const onNext = () => { setDir(1);  setCurr(addMonths(curr, 1)); };
  const openCreate = () => { setEditEvent(null); setModalOpen(true); };

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
    <div className="flex flex-col h-screen overflow-hidden bg-[#050508]">
      <Navbar onMenuToggle={() => setSidebarOpen(s => !s)} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onCreateEvent={openCreate} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 no-sb z-10">
          <div className="max-w-[1400px] mx-auto h-full flex flex-col gap-6">
            
            {/* Header / Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.05]">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-1">Temporal Scheduling Interface</span>
                <div className="flex items-center gap-4">
                  <h1 className="text-3xl font-black text-white tracking-tighter uppercase">{format(curr, 'MMMM yyyy')}</h1>
                  <div className="flex items-center gap-1 p-1 glass rounded-lg border-white/[0.05]">
                    <button onClick={onPrev} className="p-1.5 hover:bg-white/5 rounded-md text-zinc-400 hover:text-white transition-colors"><ChevronLeft size={16} /></button>
                    <button onClick={() => setCurr(new Date())} className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Current</button>
                    <button onClick={onNext} className="p-1.5 hover:bg-white/5 rounded-md text-zinc-400 hover:text-white transition-colors"><ChevronRight size={16} /></button>
                  </div>
                </div>
              </div>
              
              <div className="hidden lg:flex items-center gap-8 px-6 py-3 glass rounded-xl border-cyan-500/10">
                <div className="text-center">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Deployment Load</p>
                  <p className="text-lg font-black text-white">{events.length} <span className="text-[10px] text-zinc-600">UNITS</span></p>
                </div>
              </div>
            </div>

            {/* Calendar Grid Container */}
            <div className="flex-1 min-h-[600px] flex flex-col pt-2">
              {/* Day Headers */}
              <div className="grid grid-cols-7 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-center py-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 border-b border-white/[0.03]">
                    {d}
                  </div>
                ))}
              </div>

              {/* Grid Layout */}
              <div className="flex-1 relative overflow-hidden rounded-xl border border-white/[0.04]">
                <AnimatePresence custom={dir} mode="wait" initial={false}>
                  <motion.div
                    key={curr.toISOString()}
                    custom={dir}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="grid grid-cols-7 absolute inset-0 divide-x divide-y divide-white/[0.04]"
                  >
                    {days.map((day, i) => {
                      const isTodayDate = isToday(day);
                      const isOOR = !isSameMonth(day, startM);
                      const dayEvents = getEventsForDay(day);

                      return (
                        <div
                          key={i}
                          className={cn(
                            "relative min-h-[100px] group transition-all p-2",
                            isOOR ? "bg-black/20 opacity-30" : "hover:bg-white/[0.02]",
                            isTodayDate && "bg-cyan-500/[0.03]"
                          )}
                        >
                          {/* Day Number HUD */}
                          <div className="flex justify-between items-start mb-2">
                            <span className={cn(
                              "text-[10px] font-black font-mono w-6 h-6 flex items-center justify-center rounded-sm transition-all",
                              isTodayDate ? "bg-cyan-500 text-black glow-accent" : "text-zinc-500 group-hover:text-zinc-300"
                            )}>
                              {format(day, 'd')}
                            </span>
                            {isTodayDate && <div className="text-[9px] font-black text-cyan-500 uppercase tracking-tighter glow-text">CURRENT</div>}
                          </div>

                          {/* Events Stack */}
                          <div className="space-y-1">
                            {dayEvents.slice(0, 4).map(e => {
                              const done = e.status === 'completed';
                              return (
                                <motion.button
                                  initial={{ x: -4, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                                  key={e.id}
                                  onClick={() => { setEditEvent(e); setModalOpen(true); }}
                                  className={cn(
                                    "w-full text-left px-2 py-1 rounded-sm text-[9px] font-bold border truncate transition-all",
                                    done 
                                      ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-600 opacity-60 line-through" 
                                      : "bg-cyan-500/10 border-cyan-500/10 text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-500/15"
                                  )}
                                >
                                  {e.title}
                                </motion.button>
                              );
                            })}
                            {dayEvents.length > 4 && (
                              <p className="text-[8px] font-bold text-zinc-600 px-2 uppercase tracking-widest mt-1">+ {dayEvents.length - 4} EXTRAS</p>
                            )}
                          </div>

                          {/* Corner Accents (Pseudo HUD) */}
                          <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      );
                    })}
                  </motion.div>
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
