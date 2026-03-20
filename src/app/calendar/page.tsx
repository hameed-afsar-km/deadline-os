'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { useEventStore } from '@/store/useEventStore';
import { subscribeToEvents } from '@/lib/firestore';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { EventModal } from '@/components/EventModal';
import { EventCard } from '@/components/EventCard';
import { DeadlineEvent } from '@/types';
import { toDate } from '@/utils/dateHelpers';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, addMonths, subMonths } from 'date-fns';

const CAT_COLOR: Record<string, string> = {
  Study:      '#FCD34D',
  Hackathon:  '#C4B5FD',
  Submission: '#FB7185',
  Personal:   '#34D399',
  Exam:       '#F59E0B',
};

export default function CalendarPage() {
  const router   = useRouter();
  const { user, loading: authLoading }  = useUserStore();
  const { events, setEvents }           = useEventStore();
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editEvent,    setEditEvent]    = useState<DeadlineEvent | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay,  setSelectedDay]  = useState<Date | null>(null);
  const [mounted,      setMounted]      = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (!authLoading && !user) router.replace('/login'); }, [user, authLoading, router]);
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToEvents(user.uid, setEvents);
    return () => unsub();
  }, [user, setEvents]);

  if (authLoading || !user || !mounted) return <LoadingScreen />;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd   = endOfMonth(currentMonth);
  const days       = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad   = getDay(monthStart);
  const WEEK       = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const eventsOn      = (day: Date) => events.filter((e) => isSameDay(toDate(e.deadline), day));
  const selectedEvents = selectedDay ? eventsOn(selectedDay) : [];

  const openCreate = () => { setEditEvent(null); setModalOpen(true); };
  const openEdit   = (ev: DeadlineEvent) => { setEditEvent(ev); setModalOpen(true); };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onMenuToggle={() => setSidebarOpen((o) => !o)} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden relative z-10 w-full max-w-[1600px] mx-auto">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onCreateEvent={openCreate} />

        <main className="flex-1 overflow-y-auto px-5 md:px-10 py-10 hide-scrollbar scroll-smooth">
          <div className="max-w-[1200px] mx-auto space-y-10">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between pb-6 border-b"
              style={{ borderColor: 'var(--b1)' }}
            >
              <div className="flex items-center gap-5">
                <div className="p-4 rounded-2xl" style={{ background: 'var(--s2)', border: '1px solid var(--b2)' }}>
                  <CalIcon size={24} style={{ color: 'var(--amber)' }} />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--t0)' }}>Calendar</h1>
                  <p className="text-sm font-medium mt-1" style={{ color: 'var(--t2)' }}>Bird's-eye temporal map</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(245,158,11,0.25)' }}
                whileTap={{ scale: 0.96 }}
                onClick={openCreate}
                className="hidden sm:inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold shrink-0"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #B45309)', color: '#0C0A09' }}
              >
                <Plus size={16} /> New Deadline
              </motion.button>
            </motion.div>

            {/* Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="card overflow-hidden"
            >
              {/* Month Nav */}
              <div className="flex items-center justify-between px-8 py-6 border-b" style={{ borderColor: 'var(--b1)' }}>
                <AnimatePresence mode="popLayout">
                  <motion.h2
                    key={currentMonth.getTime()}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    className="text-2xl font-extrabold tracking-tight"
                    style={{ color: 'var(--t0)' }}
                  >
                    {format(currentMonth, 'MMMM yyyy')}
                  </motion.h2>
                </AnimatePresence>
                <div className="flex items-center gap-1.5 p-1.5 rounded-xl border" style={{ borderColor: 'var(--b1)', background: 'var(--s1)' }}>
                  <motion.button
                    whileHover={{ scale: 1.1, background: 'var(--s3)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--t2)' }}
                  >
                    <ChevronLeft size={16} />
                  </motion.button>
                  <motion.button
                    whileHover={{ background: 'var(--s3)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setCurrentMonth(new Date()); setSelectedDay(new Date()); }}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                    style={{ color: 'var(--t2)' }}
                  >
                    Today
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, background: 'var(--s3)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--t2)' }}
                  >
                    <ChevronRight size={16} />
                  </motion.button>
                </div>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--b1)', background: 'var(--s2)' }}>
                {WEEK.map((d) => (
                  <div key={d} className="py-4 text-center text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--t4)' }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7">
                {Array.from({ length: startPad }).map((_, i) => (
                  <div key={`pad-${i}`} className="min-h-[120px] border-r border-b" style={{ borderColor: 'var(--b1)', background: 'var(--bg)' }} />
                ))}
                {days.map((day, idx) => {
                  const dayEvs  = eventsOn(day);
                  const isToday = isSameDay(day, new Date());
                  const isSel   = selectedDay ? isSameDay(day, selectedDay) : false;
                  const isLast  = (startPad + idx) % 7 === 6;

                  return (
                    <motion.div
                      key={day.toISOString()}
                      whileHover={{ backgroundColor: 'var(--s3)' }}
                      onClick={() => setSelectedDay(isSel ? null : day)}
                      className="min-h-[120px] p-2.5 cursor-pointer border-b transition-colors"
                      style={{
                        borderColor: 'var(--b1)',
                        borderRight: !isLast ? '1px solid var(--b1)' : 'none',
                        background: isSel ? 'var(--s4)' : 'transparent',
                        boxShadow: isSel ? 'inset 0 0 0 1px var(--amber)' : 'none'
                      }}
                    >
                      <div className="flex justify-end mb-2">
                        <span
                          className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-extrabold transition-all`}
                          style={
                            isToday
                              ? { background: 'var(--amber)', color: '#0C0A09' }
                              : isSel
                              ? { background: 'var(--s1)', color: 'var(--amber)', border: '1px solid var(--amber)' }
                              : { color: 'var(--t3)' }
                          }
                        >
                          {format(day, 'd')}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {dayEvs.slice(0, 3).map((e) => {
                          const c = CAT_COLOR[e.category] ?? '#F59E0B';
                          return (
                            <div
                              key={e.id}
                              className="text-[10px] px-2 py-1 rounded-md truncate font-bold"
                              style={{
                                background: `${c}15`,
                                color: c,
                                border: `1px solid ${c}25`,
                                opacity: e.status === 'completed' ? 0.3 : 1,
                              }}
                            >
                              {e.title}
                            </div>
                          );
                        })}
                        {dayEvs.length > 3 && (
                          <div className="text-[10px] font-bold px-1.5" style={{ color: 'var(--t4)' }}>
                            +{dayEvs.length - 3} more
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Day Detail View */}
            <AnimatePresence mode="wait">
              {selectedDay && (
                <motion.div
                  key={selectedDay.toISOString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as any }}
                  className="space-y-6 pt-4"
                >
                  <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-extrabold" style={{ color: 'var(--t0)' }}>
                      {format(selectedDay, 'EEEE, MMMM d')}
                    </h3>
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: 'var(--t2)', background: 'var(--s2)', border: '1px solid var(--b2)' }}
                    >
                      {selectedEvents.length} Tasks
                    </span>
                  </div>

                  {selectedEvents.length === 0 ? (
                    <div className="card py-16 text-center border-dashed">
                      <Sparkles size={32} className="mx-auto mb-4" style={{ color: 'var(--t4)' }} />
                      <p className="text-lg font-bold" style={{ color: 'var(--t0)' }}>Empty day.</p>
                      <p className="text-sm font-medium mt-1" style={{ color: 'var(--t2)' }}>Enjoy the quiet, or add a new deadline.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {selectedEvents.map((e) => (
                        <EventCard key={e.id} event={e} onEdit={openEdit} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </main>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <EventModal event={editEvent} onClose={() => { setModalOpen(false); setEditEvent(null); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-dashed opacity-20 animate-spin-slow" style={{ borderColor: 'var(--amber)' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full animate-breathe" style={{ background: 'var(--amber)', boxShadow: '0 0 20px var(--amber)' }} />
          </div>
        </div>
        <p className="text-sm font-bold tracking-widest uppercase" style={{ color: 'var(--t3)' }}>Loading Map</p>
      </div>
    </div>
  );
}
