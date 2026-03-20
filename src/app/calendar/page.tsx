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
import { cn } from '@/utils/cn';

const P_CFG: Record<string, string> = {
  high:   'bg-red-500',
  medium: 'bg-amber-500',
  low:    'bg-emerald-500',
  auto:   'bg-blue-500',
};

const P_TEXT: Record<string, string> = {
  high:   'text-red-700',
  medium: 'text-amber-700',
  low:    'text-emerald-700',
  auto:   'text-blue-700',
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
    enter: (d:number) => ({ x: d > 0 ? 30 : -30, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d:number) => ({ x: d < 0 ? 30 : -30, opacity: 0 }),
  };

  return (
    <div className="min-h-screen flex flex-col relative z-20 bg-slate-50 font-sans">
      <Navbar onMenuToggle={() => setSidebarOpen(o=>!o)} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden w-full max-w-7xl mx-auto px-4 mt-6">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onCreateEvent={openCreate} />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-12 pt-2 no-sb flex flex-col items-center">
          
          <div className="w-full bg-white p-6 md:p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                {format(curr, 'MMMM yyyy')}
              </h2>
              <div className="flex gap-2">
                <button onClick={onPrev}
                  className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors border border-slate-200">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={onNext}
                  className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors border border-slate-200">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="relative z-10 w-full overflow-hidden">
              <div className="grid grid-cols-7 mb-4">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                  <div key={d} className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500">{d}</div>
                ))}
              </div>

              <div className="relative overflow-hidden min-h-[500px] border border-slate-100 bg-white rounded-2xl shadow-sm">
                <AnimatePresence custom={dir} mode="wait" initial={false}>
                  <motion.div key={curr.toString()} custom={dir}
                    variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration:0.3, ease:'easeInOut' }}
                    className="grid grid-cols-7 h-full w-full absolute inset-0 divide-x divide-y divide-slate-100">
                    
                    {days.map((d, i) => {
                      const evs = events.filter(e => {
                        const ed = e.deadline instanceof Timestamp ? e.deadline.toDate() : new Date(e.deadline as string);
                        return isSameDay(ed, d);
                      });
                      const sameMo  = isSameMonth(d, startM);
                      const isTod   = isToday(d);

                      return (
                        <div key={i} className={`min-h-[100px] md:min-h-[120px] p-2 flex flex-col gap-1.5 overflow-y-auto no-sb transition-colors hover:bg-slate-50 ${!sameMo?'opacity-40 bg-slate-50':''}`}>
                          <div className={`text-xs font-bold mb-1 w-7 h-7 flex items-center justify-center rounded-full mx-1 mt-1 ${
                            isTod ? 'bg-blue-600 text-white shadow-md' : 'text-slate-700'
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
                                  "px-2.5 py-1.5 rounded-lg text-xs font-semibold truncate cursor-pointer transition-colors border shadow-sm",
                                  done ? "opacity-50 bg-slate-100 border-slate-200 text-slate-500 line-through" :
                                  over ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" :
                                  `bg-white border-slate-200 hover:border-slate-300 shadow-sm ${P_TEXT[p]}`
                                )}>
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-500">Loading Workspace...</p>
      </div>
    </div>
  );
}
