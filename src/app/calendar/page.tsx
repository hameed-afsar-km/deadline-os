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
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  getDay,
  addMonths,
  subMonths,
} from 'date-fns';

const CATEGORY_COLORS: Record<string, string> = {
  Study: '#6366f1',
  Hackathon: '#a855f7',
  Submission: '#f43f5e',
  Personal: '#10b981',
  Exam: '#f59e0b',
};

export default function CalendarPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUserStore();
  const { events, setEvents } = useEventStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<DeadlineEvent | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToEvents(user.uid, setEvents);
    return () => unsub();
  }, [user, setEvents]);

  if (authLoading || !user) return <LoadingScreen />;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart); // 0=Sun
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const eventsOnDay = (day: Date) =>
    events.filter((e) => isSameDay(toDate(e.deadline), day));

  const selectedEvents = selectedDay ? eventsOnDay(selectedDay) : [];

  const openCreate = () => { setEditEvent(null); setModalOpen(true); };
  const openEdit = (ev: DeadlineEvent) => { setEditEvent(ev); setModalOpen(true); };

  const prevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
  const nextMonth = () => setCurrentMonth((m) => addMonths(m, 1));
  const goToday = () => {
    setCurrentMonth(new Date());
    setSelectedDay(new Date());
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-purple-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-500/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <Navbar onMenuToggle={() => setSidebarOpen((o) => !o)} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onCreateEvent={openCreate} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-6xl mx-auto space-y-8"
          >
            
            {/* Header Area */}
            <motion.div variants={containerVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
              <div>
                <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 flex items-center gap-3">
                  <CalendarIcon size={28} className="text-purple-400" />
                  Visual Calendar
                </h1>
                <p className="text-sm font-medium mt-2 text-gray-400">
                  Bird's eye view of all your temporal commitments.
                </p>
              </div>
            </motion.div>

            {/* Calendar Container */}
            <motion.div
              variants={containerVariants}
              className="rounded-3xl overflow-hidden bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl"
            >
              {/* Month Header */}
              <div className="flex items-center justify-between px-8 py-6 bg-white/[0.02] border-b border-white/5">
                <AnimatePresence mode="popLayout">
                  <motion.h2 
                    key={currentMonth.toString()}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="text-2xl font-black tracking-tight text-white"
                  >
                    {format(currentMonth, 'MMMM yyyy')}
                  </motion.h2>
                </AnimatePresence>

                <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                    <ChevronLeft size={18} className="text-gray-300" />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={goToday} className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                    Today
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                    <ChevronRight size={18} className="text-gray-300" />
                  </motion.button>
                </div>
              </div>

              {/* Grid Context */}
              <div className="bg-black/60">
                {/* Weekdays */}
                <div className="grid grid-cols-7 border-b border-white/5">
                  {weekDays.map((d) => (
                    <div key={d} className="py-4 text-center text-xs font-bold uppercase tracking-widest text-gray-500 bg-white/[0.02]">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 bg-white/[0.02] gap-px">
                  {/* Padding */}
                  {Array.from({ length: startPadding }).map((_, i) => (
                     <div key={`pad-${i}`} className="min-h-[120px] bg-black/40" />
                  ))}

                  {/* Day Cells */}
                  {days.map((day) => {
                    const dayEvents = eventsOnDay(day);
                    const isToday_ = isSameDay(day, new Date());
                    const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
                    
                    return (
                      <motion.div
                        layoutId={`day-${day.toISOString()}`}
                        key={day.toISOString()}
                        onClick={() => setSelectedDay(isSelected ? null : day)}
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                        className={cn(
                          'min-h-[120px] p-3 cursor-pointer transition-colors relative group overflow-hidden',
                          isSelected ? 'bg-indigo-500/10' : 'bg-transparent'
                        )}
                        style={{
                          boxShadow: isSelected ? 'inset 0 0 0 1px rgba(99,102,241,0.5)' : 'none',
                        }}
                      >
                        {isSelected && (
                           <motion.div layoutId="selection-ring" className="absolute inset-0 bg-indigo-500/20 border-2 border-indigo-500 blur-[2px] rounded-sm pointer-events-none" />
                        )}

                        {/* Day Number */}
                        <div className="flex justify-end mb-3">
                          <span
                            className={cn(
                              'w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold relative z-10 transition-all duration-300',
                              isToday_ ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50 scale-110' : 
                              isSelected ? 'bg-indigo-500/30 text-indigo-300' : 'text-gray-500 group-hover:text-white'
                            )}
                          >
                            {format(day, 'd')}
                          </span>
                        </div>

                        {/* Event Tags */}
                        <div className="space-y-1.5 relative z-10 mix-blend-luminosity hover:mix-blend-normal transition-all duration-300">
                          {dayEvents.slice(0, 3).map((e) => (
                            <motion.div
                              layoutId={`event-${e.id}`}
                              key={e.id}
                              className="text-[10px] px-2 py-1 rounded-lg truncate font-bold text-white shadow-sm"
                              style={{
                                background: CATEGORY_COLORS[e.category] ?? '#6366f1',
                                opacity: e.status === 'completed' ? 0.3 : 1,
                              }}
                            >
                              {e.title}
                            </motion.div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2 mt-2">
                              +{dayEvents.length - 3} MORE
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Selected Day view */}
            <AnimatePresence mode="wait">
              {selectedDay && (
                <motion.div 
                  key={selectedDay.toISOString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="pt-6"
                >
                  <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-4">
                    <h3 className="text-3xl font-black text-white">
                      {format(selectedDay, 'EEEE, MMMM d')}
                    </h3>
                    <motion.span 
                       initial={{ scale: 0 }} animate={{ scale: 1 }}
                       className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg"
                      style={{ background: 'rgba(124,58,237,0.2)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.3)' }}>
                      {selectedEvents.length} Event{selectedEvents.length !== 1 && 's'}
                    </motion.span>
                  </div>

                  {selectedEvents.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-[2.5rem] py-20 text-center border border-white/5 bg-white/[0.02]" 
                    >
                      <div className="text-6xl mb-4 opacity-50">🍃</div>
                      <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Day is clear</p>
                    </motion.div>
                  ) : (
                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      <AnimatePresence>
                        {selectedEvents.map((e, i) => (
                           <EventCard key={e.id} event={e} onEdit={openEdit} />
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
          </motion.div>
        </main>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <EventModal
            event={editEvent}
            onClose={() => { setModalOpen(false); setEditEvent(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-6 bg-[#050505]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="relative w-20 h-20"
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 blur-xl opacity-50" />
        <div className="absolute inset-2 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
           <span className="font-black text-white text-2xl">D</span>
        </div>
      </motion.div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Loading Grid</h2>
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
             <motion.div
               key={i}
               className="w-2 h-2 rounded-full bg-purple-500"
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
             />
          ))}
        </div>
      </div>
    </div>
  );
}
