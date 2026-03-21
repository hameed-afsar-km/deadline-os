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
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar onMenuToggle={() => setSidebarOpen(s => !s)} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onCreateEvent={openCreate} />

        <main className="flex-1 overflow-y-auto p-5 md:p-8 no-sb">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">Calendar</h1>
              <p className="text-sm text-[--c-muted] font-medium">View your tasks by date</p>
            </div>
            <div className="flex items-center gap-2 glass-hi border border-white/[0.07] rounded-xl p-1">
              <button onClick={onPrev} className="w-9 h-9 rounded-lg flex items-center justify-center text-[--c-muted] hover:text-white hover:bg-white/[0.08] transition-colors">
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-bold text-white min-w-[130px] text-center px-2">{format(curr, 'MMMM yyyy')}</span>
              <button onClick={onNext} className="w-9 h-9 rounded-lg flex items-center justify-center text-[--c-muted] hover:text-white hover:bg-white/[0.08] transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[0.65rem] font-bold uppercase tracking-widest text-[--c-muted] py-2">{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] glass-hi" style={{ minHeight: '560px' }}>
            <AnimatePresence custom={dir} mode="wait" initial={false}>
              <motion.div
                key={curr.toISOString()}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-7 divide-x divide-y divide-white/[0.05] absolute inset-0"
              >
                {days.map((day, i) => {
                  const dayEvs  = getEventsForDay(day);
                  const inMonth = isSameMonth(day, startM);
                  const today   = isToday(day);

                  return (
                    <div key={i} className={cn(
                      'min-h-[100px] p-2 flex flex-col gap-1.5 overflow-hidden transition-colors',
                      !inMonth && 'opacity-30 bg-black/20',
                      today && 'bg-violet-500/[0.05]',
                    )}>
                      {/* Date number */}
                      <div className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold self-start flex-shrink-0',
                        today ? 'grad-accent text-white shadow-[0_0_12px_rgba(124,58,237,0.5)]' : 'text-[--c-muted]'
                      )}>
                        {format(day, 'd')}
                      </div>

                      {/* Events */}
                      {dayEvs.slice(0, 3).map(ev => {
                        const p    = getEffectivePriority(ev);
                        const col  = P_COLOR[p] || P_COLOR.auto;
                        const done = ev.status === 'completed';
                        const over = isOverdue(ev) && !done;
                        return (
                          <motion.button
                            key={ev.id}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => { setEditEvent(ev); setModalOpen(true); }}
                            className={cn(
                              'w-full text-left px-2 py-1 rounded-lg text-[0.65rem] font-semibold truncate border transition-colors',
                              done ? 'opacity-40 bg-white/[0.04] border-white/[0.05] text-[--c-muted] line-through' :
                              over ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' :
                              'border-transparent text-white'
                            )}
                            style={!done && !over ? { background: `${col}18`, borderColor: `${col}30`, color: '#fff' } : undefined}
                          >
                            <span className="inline-flex items-center gap-1">
                              {!done && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 inline-block" style={{ background: col }} />}
                              {ev.title}
                            </span>
                          </motion.button>
                        );
                      })}

                      {dayEvs.length > 3 && (
                        <span className="text-[0.6rem] text-[--c-muted] font-medium pl-1">+{dayEvs.length - 3} more</span>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {modalOpen && <EventModal event={editEvent} onClose={() => { setModalOpen(false); setEditEvent(null); }} />}
      </AnimatePresence>
    </div>
  );
}
