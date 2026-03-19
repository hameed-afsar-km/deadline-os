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
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-void)' }}>
      <Navbar onMenuToggle={() => setSidebarOpen((o) => !o)} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onCreateEvent={openCreate}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className={`max-w-6xl mx-auto space-y-8 ${mounted ? 'animate-fade-up' : 'opacity-0'}`}>
            
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black gradient-text flex items-center gap-2">
                  <CalendarIcon size={24} style={{ color: '#a855f7' }} />
                  Your Calendar
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-mid)' }}>
                  Visual overview of all your upcoming deadlines.
                </p>
              </div>
            </div>

            {/* Calendar Container */}
            <div
              className="rounded-3xl overflow-hidden glass-solid"
              style={{ border: '1px solid var(--border-mid)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
            >
              {/* Month Header */}
              <div className="flex items-center justify-between px-6 py-5" style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border-dim)' }}>
                <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-white)' }}>
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-2 bg-black/20 p-1 rounded-xl" style={{ border: '1px solid var(--border-dim)' }}>
                  <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/10 transition-colors active:scale-90">
                    <ChevronLeft size={16} style={{ color: 'var(--text-bright)' }} />
                  </button>
                  <button onClick={goToday} className="px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-white/10 transition-colors active:scale-95" style={{ color: 'var(--text-bright)' }}>
                    Today
                  </button>
                  <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/10 transition-colors active:scale-90">
                    <ChevronRight size={16} style={{ color: 'var(--text-bright)' }} />
                  </button>
                </div>
              </div>

              {/* Grid Context */}
              <div className="bg-black/40">
                {/* Weekdays */}
                <div className="grid grid-cols-7 border-b border-white/5">
                  {weekDays.map((d) => (
                    <div key={d} className="py-3 text-center text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
                      {d}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 bg-white/[0.02] gap-px">
                  {/* Padding */}
                  {Array.from({ length: startPadding }).map((_, i) => (
                     <div key={`pad-${i}`} className="min-h-[100px] bg-black/40" />
                  ))}

                  {/* Day Cells */}
                  {days.map((day) => {
                    const dayEvents = eventsOnDay(day);
                    const isToday_ = isSameDay(day, new Date());
                    const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
                    
                    return (
                      <div
                        key={day.toISOString()}
                        onClick={() => setSelectedDay(isSelected ? null : day)}
                        className={cn(
                          'min-h-[100px] p-2 cursor-pointer transition-all duration-200 group relative',
                          isSelected ? 'bg-indigo-500/10' : 'bg-transparent hover:bg-white/5'
                        )}
                        style={{
                          boxShadow: isSelected ? 'inset 0 0 0 1px rgba(99,102,241,0.5)' : 'none',
                        }}
                      >
                        {/* Day Number */}
                        <div className="flex justify-end mb-2">
                          <span
                            className={cn(
                              'w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all duration-200',
                              isToday_ ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40' : 
                              isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-400 group-hover:text-white'
                            )}
                          >
                            {format(day, 'd')}
                          </span>
                        </div>

                        {/* Event Tags */}
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map((e) => (
                            <div
                              key={e.id}
                              className="text-[10px] px-1.5 py-0.5 rounded-md truncate font-bold text-white shadow-sm"
                              style={{
                                background: CATEGORY_COLORS[e.category] ?? '#6366f1',
                                opacity: e.status === 'completed' ? 0.4 : 1,
                              }}
                            >
                              {e.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-[10px] font-bold px-1.5" style={{ color: 'var(--text-mid)' }}>
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected Day view */}
            {selectedDay && (
              <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text-white)' }}>
                    {format(selectedDay, 'EEEE, MMMM d')}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black shadow-lg"
                    style={{ background: 'rgba(124,58,237,0.2)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.3)' }}>
                    {selectedEvents.length} Event{selectedEvents.length !== 1 && 's'}
                  </span>
                </div>

                {selectedEvents.length === 0 ? (
                  <div className="rounded-3xl py-12 text-center" style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border-mid)' }}>
                    <div className="text-4xl mb-3 opacity-50">🍃</div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-mid)' }}>No deadlines for this day.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {selectedEvents.map((e, i) => (
                      <EventCard key={e.id} event={e} onEdit={openEdit} style={{ animationDelay: `${i * 50}ms` }} />
                    ))}
                  </div>
                )}
              </div>
            )}
            
          </div>
        </main>
      </div>

      {modalOpen && (
        <EventModal
          event={editEvent}
          onClose={() => { setModalOpen(false); setEditEvent(null); }}
        />
      )}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4" style={{ background: 'var(--bg-void)' }}>
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl animate-pulse-glow"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7)' }} />
        <div className="absolute inset-0 rounded-2xl animate-ping opacity-30"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }} />
      </div>
      <div className="text-center">
        <p className="font-bold gradient-text text-lg">DeadlineOS</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Loading calendar...</p>
      </div>
    </div>
  );
}
