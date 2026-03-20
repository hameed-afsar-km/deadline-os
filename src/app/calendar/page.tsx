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
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, isToday } from 'date-fns';

const P_CFG: Record<string, string> = {
  high:   'bg-rose-500',
  medium: 'bg-orange-500',
  low:    'bg-emerald-500',
  auto:   'bg-violet-500',
};

export default function CalendarPage() {
  const router = useRouter();
  const { user, loading:authLoading } = useUserStore();
  const { events, setEvents } = useEventStore();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editEvent,   setEditEvent]   = useState<DeadlineEvent|null>(null);
  
  const [curr, setCurr] = useState(new Date());
  const [dir,  setDir]  = useState(0);

  useEffect(() => { if (!authLoading && !user) router.replace('/login'); }, [user, authLoading, router]);

  if (authLoading) return <Spinner />;
  if (!user) return null;

  const openCreate = () => { setEditEvent(null); setModalOpen(true); };

  const onPrev = () => { setDir(-1); setCurr(subMonths(curr, 1)); };
  const onNext = () => { setDir(1);  setCurr(addMonths(curr, 1)); };

  // Generate grid
  const startM = startOfMonth(curr);
  const endM   = endOfMonth(startM);
  const startW = startOfWeek(startM);
  const endW   = endOfWeek(endM);

  const days: Date[] = [];
  let currentD = startW;
  while (currentD <= endW) {
    days.push(currentD);
    currentD = addDays(currentD, 1);
  }

  // Anim variants
  const variants = {
    enter: (d:number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d:number) => ({ x: d < 0 ? 40 : -40, opacity: 0 }),
  };

  return (
    <div className="min-h-screen flex flex-col relative z-20">
      <Navbar onMenuToggle={() => setSidebarOpen(o=>!o)} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden w-full max-w-[1600px] mx-auto mt-6 px-4">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onCreateEvent={openCreate} />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-12 pt-2 no-sb flex flex-col items-center">
          
          <div className="w-full max-w-6xl glass-panel p-6 md:p-8 rounded-[32px] border border-white/5 flex flex-col shadow-2xl relative overflow-hidden">
            {/* Ambient gradients */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-600/10 blur-[100px] pointer-events-none rounded-full" />

            {/* Header */}
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white" style={{ fontFamily:'var(--font-outfit)' }}>
                {format(curr, 'MMMM yyyy')}
              </h2>
              <div className="flex gap-2">
                <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.9 }} onClick={onPrev}
                  className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition-all border border-white/10 shadow-sm">
                  <ChevronLeft size={24} />
                </motion.button>
                <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.9 }} onClick={onNext}
                  className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition-all border border-white/10 shadow-sm">
                  <ChevronRight size={24} />
                </motion.button>
              </div>
            </div>

            {/* Calendar Grid Container */}
            <div className="relative z-10">
              {/* Day Headers */}
              <div className="grid grid-cols-7 mb-4">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                  <div key={d} className="text-center text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">{d}</div>
                ))}
              </div>

              {/* Grid body */}
              <div className="relative overflow-hidden min-h-[500px] border border-white/5 bg-black/20 rounded-2xl backdrop-blur-md">
                <AnimatePresence custom={dir} mode="wait" initial={false}>
                  <motion.div key={curr.toString()} custom={dir}
                    variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration:0.4, ease:[0.16,1,0.3,1] }}
                    className="grid grid-cols-7 h-full w-full absolute inset-0 divide-x divide-y divide-white/5">
                    
                    {days.map((d, i) => {
                      const evs = events.filter(e => {
                        const ed = e.deadline instanceof Timestamp ? e.deadline.toDate() : new Date(e.deadline as string);
                        return isSameDay(ed, d);
                      });
                      const sameMo  = isSameMonth(d, startM);
                      const isTod   = isToday(d);

                      return (
                        <div key={i} className={`min-h-[100px] md:min-h-[120px] p-2 flex flex-col gap-1 overflow-y-auto no-sb transition-colors hover:bg-white/5 ${!sameMo?'opacity-30':''}`}>
                          <div className={`text-xs font-bold mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                            isTod ? 'bg-gradient-to-tr from-cyan-400 to-violet-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)]' 
                                  : 'text-slate-400'
                          }`} style={{ fontFamily:'var(--font-outfit)' }}>
                            {format(d, 'd')}
                          </div>

                          {evs.map(ev => {
                            const p = getEffectivePriority(ev);
                            const done = ev.status === 'completed';
                            const over = isOverdue(ev);
                            return (
                              <motion.div key={ev.id} whileHover={done?{}:{scale:1.02}} onClick={() => { setEditEvent(ev); setModalOpen(true); }}
                                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold truncate cursor-pointer transition-all border ${
                                  done ? 'opacity-40 line-through bg-white/5 border-transparent text-slate-400' :
                                  over ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' :
                                  'bg-white/5 text-white border-white/10 hover:border-white/20'
                                }`}>
                                <div className="flex items-center gap-1.5">
                                  {!done && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${P_CFG[p]}`} />}
                                  <span className="truncate">{ev.title}</span>
                                </div>
                              </motion.div>
                            );
                          })}
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

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030305]">
      <div className="flex flex-col items-center gap-6">
        <Loader2 size={40} className="animate-spin text-violet-500" />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Loading Map...</p>
      </div>
    </div>
  );
}
