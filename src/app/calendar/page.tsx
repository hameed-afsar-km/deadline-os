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
import { ChevronLeft, ChevronRight, Plus, Calendar as CalIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, addMonths, subMonths } from 'date-fns';

const CAT_COLOR: Record<string, string> = {
  Study:      '#1A1AFF',
  Hackathon:  '#7c3aed',
  Submission: '#FF5533',
  Personal:   '#00C896',
  Exam:       '#F5A623',
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
    <div className="min-h-screen flex flex-col" style={{ color: 'var(--ink)' }}>
      <Navbar onMenuToggle={() => setSidebarOpen((o) => !o)} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onCreateEvent={openCreate} />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
          <div className="max-w-[1100px] mx-auto space-y-8">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between border-b-2 pb-6"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl border-2" style={{ borderColor: 'var(--ink)', background: 'var(--white)' }}>
                  <CalIcon size={22} style={{ color: 'var(--ink)' }} />
                </div>
                <div>
                  <h1 className="font-display font-black text-3xl tracking-tight" style={{ color: 'var(--ink)' }}>Calendar</h1>
                  <p className="text-sm font-medium" style={{ color: 'var(--ink-4)' }}>Bird's-eye view of your deadlines</p>
                </div>
              </div>
              <motion.button
                whileHover={{ x: -2, y: -2, boxShadow: '4px 4px 0 var(--ink)' }}
                whileTap={{ x: 0, y: 0, boxShadow: 'none' }}
                onClick={openCreate}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black text-white border-2"
                style={{ background: 'var(--ink)', borderColor: 'var(--ink)' }}
              >
                <Plus size={16} /> New Deadline
              </motion.button>
            </motion.div>

            {/* Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border-2 overflow-hidden"
              style={{ borderColor: 'var(--ink)', background: 'var(--white)' }}
            >
              {/* Month Nav */}
              <div className="flex items-center justify-between px-7 py-5 border-b-2" style={{ borderColor: 'var(--ink)' }}>
                <AnimatePresence mode="popLayout">
                  <motion.h2
                    key={currentMonth.getTime()}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    className="font-display font-black text-2xl tracking-tight"
                    style={{ color: 'var(--ink)' }}
                  >
                    {format(currentMonth, 'MMMM yyyy')}
                  </motion.h2>
                </AnimatePresence>
                <div className="flex items-center gap-1 border-2 rounded-xl p-1" style={{ borderColor: 'var(--border)' }}>
                  <motion.button
                    whileHover={{ scale: 1.1, background: 'var(--paper)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--ink-3)' }}
                  >
                    <ChevronLeft size={18} />
                  </motion.button>
                  <motion.button
                    whileHover={{ background: 'var(--paper)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setCurrentMonth(new Date()); setSelectedDay(new Date()); }}
                    className="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors"
                    style={{ color: 'var(--ink-3)' }}
                  >
                    Today
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, background: 'var(--paper)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--ink-3)' }}
                  >
                    <ChevronRight size={18} />
                  </motion.button>
                </div>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 border-b-2" style={{ borderColor: 'var(--border)' }}>
                {WEEK.map((d) => (
                  <div key={d} className="py-3.5 text-center text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--ink-4)' }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7">
                {Array.from({ length: startPad }).map((_, i) => (
                  <div key={`pad-${i}`} className="min-h-[110px] border-r border-b" style={{ borderColor: 'var(--border)', background: 'var(--paper)' }} />
                ))}
                {days.map((day, idx) => {
                  const dayEvs  = eventsOn(day);
                  const isToday = isSameDay(day, new Date());
                  const isSel   = selectedDay ? isSameDay(day, selectedDay) : false;
                  const isLast  = (startPad + idx) % 7 === 6;

                  return (
                    <motion.div
                      key={day.toISOString()}
                      whileHover={{ backgroundColor: 'var(--paper-2)' }}
                      onClick={() => setSelectedDay(isSel ? null : day)}
                      className="min-h-[110px] p-2.5 cursor-pointer border-b transition-colors"
                      style={{
                        borderColor: 'var(--border)',
                        borderRight: !isLast ? '1px solid var(--border)' : 'none',
                        background: isSel ? 'var(--paper-2)' : undefined,
                        outline: isSel ? '2px solid var(--ink)' : 'none',
                        outlineOffset: '-2px',
                      }}
                    >
                      <div className="flex justify-end mb-2">
                        <span
                          className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-black transition-all"
                          style={
                            isToday
                              ? { background: 'var(--ink)', color: '#fff' }
                              : isSel
                              ? { background: 'var(--accent)', color: '#fff' }
                              : { color: 'var(--ink-4)' }
                          }
                        >
                          {format(day, 'd')}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {dayEvs.slice(0, 2).map((e) => (
                          <div
                            key={e.id}
                            className="text-[10px] px-1.5 py-0.5 rounded-md truncate font-bold border"
                            style={{
                              background: `${CAT_COLOR[e.category] ?? '#1A1AFF'}10`,
                              color:       CAT_COLOR[e.category] ?? '#1A1AFF',
                              borderColor: `${CAT_COLOR[e.category] ?? '#1A1AFF'}30`,
                              opacity: e.status === 'completed' ? 0.4 : 1,
                            }}
                          >
                            {e.title}
                          </div>
                        ))}
                        {dayEvs.length > 2 && (
                          <div className="text-[9px] font-black uppercase tracking-wider px-1" style={{ color: 'var(--ink-4)' }}>
                            +{dayEvs.length - 2} more
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Day Detail */}
            <AnimatePresence mode="wait">
              {selectedDay && (
                <motion.div
                  key={selectedDay.toISOString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as any }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-4 border-b-2 pb-5" style={{ borderColor: 'var(--border)' }}>
                    <h3 className="font-display font-black text-2xl" style={{ color: 'var(--ink)' }}>
                      {format(selectedDay, 'EEEE, MMMM d')}
                    </h3>
                    <span
                      className="tag text-[11px]"
                      style={{ color: 'var(--ink)', borderColor: 'var(--ink)', background: 'var(--paper-2)' }}
                    >
                      {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {selectedEvents.length === 0 ? (
                    <motion.div
                      className="rounded-2xl border-2 py-16 text-center"
                      style={{ borderColor: 'var(--border)', background: 'var(--white)' }}
                    >
                      <div className="text-5xl mb-4">🍃</div>
                      <p className="font-display font-bold text-xl" style={{ color: 'var(--ink-3)' }}>Day is clear</p>
                      <p className="text-sm font-medium mt-1" style={{ color: 'var(--ink-4)' }}>No deadlines on this day.</p>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--paper)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl border-4 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--ink)' }} />
        <p className="font-bold text-sm" style={{ color: 'var(--ink-4)' }}>Loading Calendar...</p>
      </div>
    </div>
  );
}
