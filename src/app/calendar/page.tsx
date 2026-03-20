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
import { ChevronLeft, ChevronRight, Loader2, Workflow } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, isToday } from 'date-fns';
import { cn } from '@/utils/cn';

const P_CFG: Record<string, string> = {
  high:   'shadow-[0_0_8px_rgba(244,63,94,0.8)] bg-rose-500',
  medium: 'shadow-[0_0_8px_rgba(251,191,36,0.8)] bg-amber-400',
  low:    'shadow-[0_0_8px_rgba(52,211,153,0.8)] bg-emerald-400',
  auto:   'shadow-[0_0_8px_rgba(34,211,238,0.8)] bg-cyan-400',
};

const P_BORDER: Record<string, string> = {
  high:   'border-rose-500/30 text-rose-300',
  medium: 'border-amber-400/30 text-amber-300',
  low:    'border-emerald-400/30 text-emerald-300',
  auto:   'border-cyan-400/30 text-cyan-300',
};

export default function CalendarPage() {
  const router = useRouter();
  const { user, loading:authLoading } = useUserStore();
  const { events } = useEventStore();
  
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

  const variants = {
    enter: (d:number) => ({ x: d > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d:number) => ({ x: d < 0 ? 50 : -50, opacity: 0 }),
  };

  return (
    <div className="min-h-screen flex flex-col relative text-zinc-100 font-sans selection:bg-cyan-500/30">
      <Navbar onMenuToggle={() => setSidebarOpen(o=>!o)} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden w-full max-w-[1600px] mx-auto px-4 mt-6">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onCreateEvent={openCreate} />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-12 pt-2 no-sb flex flex-col items-center relative z-10 w-full">
          
          <div className="w-full relative glass-card p-6 md:p-10 rounded-[40px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[60px] -mx-20 -my-20 pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl glass-panel flex items-center justify-center text-cyan-400 border border-white/5">
                  <Workflow size={24} />
                </div>
                <div>
                  <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tighter text-white drop-shadow-lg">
                    {format(curr, 'MMMM yyyy')}
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 mt-1">Timeline Matrix</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3 glass-panel p-2 rounded-2xl border border-white/5 backdrop-blur-md">
                <button onClick={onPrev} className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-white/10">
                  <ChevronLeft size={24} />
                </button>
                <div className="w-[1px] h-8 bg-white/10" />
                <button onClick={onNext} className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-white/10">
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="relative z-10 w-full overflow-hidden">
              <div className="grid grid-cols-7 mb-4 px-2">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                  <div key={d} className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{d}</div>
                ))}
              </div>

              <div className="relative overflow-hidden min-h-[600px] border border-white/5 glass-panel rounded-3xl shadow-2xl">
                <AnimatePresence custom={dir} mode="wait" initial={false}>
                  <motion.div key={curr.toString()} custom={dir}
                    variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration:0.4, ease:[0.16, 1, 0.3, 1] }}
                    className="grid grid-cols-7 h-full w-full absolute inset-0 divide-x divide-y divide-white/5 bg-black/20">
                    
                    {days.map((d, i) => {
                      const evs = events.filter(e => {
                        const ed = e.deadline instanceof Timestamp ? e.deadline.toDate() : new Date(e.deadline as string);
                        return isSameDay(ed, d);
                      });
                      const sameMo  = isSameMonth(d, startM);
                      const isTod   = isToday(d);

                      return (
                        <div key={i} className={`min-h-[120px] p-2 md:p-3 flex flex-col gap-2 overflow-y-auto no-sb transition-colors hover:bg-white/[0.03] ${!sameMo?'opacity-30 bg-black/40':''}`}>
                          <div className={`text-xs font-black mb-1 w-8 h-8 flex items-center justify-center rounded-xl mx-auto md:mx-0 mt-1 ${
                            isTod ? 'bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.5)] border border-cyan-400/50' : 'text-zinc-500'
                          }`}>
                            {format(d, 'd')}
                          </div>

                          {evs.map(ev => {
                            const p = getEffectivePriority(ev);
                            const done = ev.status === 'completed';
                            const over = isOverdue(ev);
                            
                            return (
                              <motion.div key={ev.id} whileHover={done?{}:{scale:1.02}} onClick={() => { setEditEvent(ev); setModalOpen(true); }}
                                className={cn(
                                  "px-3 py-2 rounded-xl text-xs font-bold truncate cursor-pointer transition-all border shadow-lg backdrop-blur-md",
                                  done ? "opacity-30 bg-white/5 border-transparent text-zinc-500 line-through grayscale hover:grayscale-0 hover:bg-white/10" :
                                  over ? "bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20" :
                                  `bg-black/60 hover:bg-white/10 ${P_BORDER[p]}`
                                )}>
                                <div className="flex items-center gap-2">
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
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-6 relative">
        <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-[60px]" />
        <Loader2 size={40} className="animate-spin text-cyan-400 relative z-10" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 relative z-10">Initializing Matrix...</p>
      </div>
    </div>
  );
}
