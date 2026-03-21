'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { useEventStore } from '@/store/useEventStore';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { EventModal } from '@/components/EventModal';
import { DeadlineEvent } from '@/types';
import { getEffectivePriority, getTimeRemaining } from '@/utils/priority';
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalIcon, Plus, Clock, Edit2, Trash2, ArrowRight, Trash } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, isToday as isTodayDate
} from 'date-fns';
import { cn } from '@/utils/cn';
import { GlowingShadow } from '@/components/ui/glowing-shadow';
import { deleteEvent } from '@/lib/firestore';
import toast from 'react-hot-toast';
import { Footer } from '@/components/Footer';

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
  const [selectedDay, setSelectedDay] = useState(new Date());

  useEffect(() => { if (!authLoading && !user) router.replace('/login'); }, [user, authLoading, router]);

  const onPrev = () => { setCurr(subMonths(curr, 1)); };
  const onNext = () => { setCurr(addMonths(curr, 1)); };

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

  const selectedTasks = useMemo(() => getEventsForDay(selectedDay), [events, selectedDay]);

  const remove = async (id: string, title: string) => {
    if (!confirm(`Permanently delete "${title}"?`)) return;
    try {
      await deleteEvent(id);
      toast.success('Objective deleted');
    } catch {
      toast.error('Task removal failed');
    }
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#030303]">
      <Loader2 size={32} className="animate-spin text-indigo-500" />
    </div>
  );
  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#030303] text-white">
      <Navbar onMenuToggle={() => setSidebarOpen(s => !s)} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onCreateEvent={() => { setEditEvent(null); setModalOpen(true); }} />

        <main className="flex-1 overflow-y-auto p-6 md:p-10 no-sb z-10">
          <div className="max-w-[1400px] mx-auto space-y-12">
            
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 mb-2 text-indigo-400">
                  <CalIcon size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Chronological View</span>
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight">{format(curr, 'MMMM yyyy')}</h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-2xl border border-white/5 shadow-inner">
                  <button onClick={onPrev} className="p-3 hover:bg-white/5 rounded-xl transition-all text-zinc-400 hover:text-white"><ChevronLeft size={20} /></button>
                  <button onClick={() => { setCurr(new Date()); setSelectedDay(new Date()); }} className="px-6 py-2 text-xs font-bold hover:text-indigo-400 transition-colors">Today</button>
                  <button onClick={onNext} className="p-3 hover:bg-white/5 rounded-xl transition-all text-zinc-400 hover:text-white"><ChevronRight size={20} /></button>
                </div>
                <GlowingShadow onClick={() => { setEditEvent(null); setModalOpen(true); }}>
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Plus size={18} /> Schedule
                  </div>
                </GlowingShadow>
              </div>
            </header>

            <div className="flex flex-col gap-12">
               {/* Main Calendar Grid */}
               <div className="w-full glass-hi rounded-[40px] overflow-hidden border-white/10 shadow-2xl flex flex-col">
                  <div className="grid grid-cols-7 border-b border-white/[0.05] bg-white/[0.01]">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="py-6 text-center text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">{day}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 flex-1 min-h-[600px]">
                    {days.map((day, i) => {
                      const dayEvents = getEventsForDay(day);
                      const notCurrentM = !isSameMonth(day, startM);
                      const isTodayDay = isTodayDate(day);
                      const isSelected = isSameDay(day, selectedDay);

                      return (
                        <motion.div
                          key={day.toISOString()}
                          onClick={() => setSelectedDay(day)}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className={cn(
                            "relative min-h-[140px] p-4 border-r border-b border-white/[0.03] transition-all cursor-pointer",
                            notCurrentM ? "bg-black/40 opacity-20" : "hover:bg-white/[0.03]",
                            isTodayDay && "bg-indigo-500/[0.04]",
                            isSelected && "bg-white/[0.06] shadow-inner"
                          )}
                        >
                          <div className={cn(
                            "w-9 h-9 flex items-center justify-center text-sm font-black rounded-2xl transition-all mb-4",
                            isTodayDay ? "bg-indigo-500 text-white shadow-xl shadow-indigo-500/30" : isSelected ? "bg-white text-black" : "text-zinc-500"
                          )}>
                            {format(day, 'd')}
                          </div>

                          <div className="space-y-1.5">
                            {dayEvents.slice(0, 3).map(e => {
                              const p = getEffectivePriority(e);
                              const col = P_COLOR[p] || P_COLOR.auto;
                              const isDone = e.status === 'completed';
                              return (
                                <div key={e.id} className="flex items-center gap-2">
                                   <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: isDone ? '#444' : col }} />
                                   <span className={cn("text-[9px] font-bold truncate", isDone ? "text-zinc-700 line-through" : "text-zinc-400")}>
                                     {e.title}
                                   </span>
                                </div>
                              );
                            })}
                            {dayEvents.length > 3 && (
                               <p className="text-[9px] font-black text-indigo-400 mt-2 px-1">+{dayEvents.length - 3} MORE</p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
               </div>

               {/* Below Calendar: Tasks for Selected Day Panel */}
               <div className="w-full space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    key={selectedDay.toISOString()}
                    className="glass-hi p-6 md:p-10 rounded-[40px] border-white/5 shadow-2xl space-y-8"
                  >
                    <div>
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Selected Date</span>
                           {isTodayDate(selectedDay) && <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase">Today</span>}
                        </div>
                        <h2 className="text-3xl font-black text-white">{format(selectedDay, 'MMM d, yyyy')}</h2>
                        <p className="text-xs text-zinc-500 font-medium mt-1">{selectedTasks.length} objectives identified</p>
                    </div>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto no-sb pr-2">
                       <AnimatePresence mode="popLayout">
                          {selectedTasks.length > 0 ? (
                            selectedTasks.map(e => {
                               const p = getEffectivePriority(e);
                               const col = P_COLOR[p] || P_COLOR.auto;
                               const isDone = e.status === 'completed';
                               return (
                                 <motion.div
                                   key={e.id}
                                   initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                   exit={{ opacity: 0, x: -20, scale: 0.9 }}
                                   className={cn(
                                     "group relative p-5 rounded-3xl border border-white/5 transition-all hover:bg-white/[0.04] overflow-hidden shadow-xl",
                                     isDone ? "opacity-40" : ""
                                   )}
                                 >
                                   <div className="flex items-start justify-between gap-4 mb-4">
                                      <div className="space-y-1">
                                         <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border" 
                                           style={{ color: col, borderColor: `${col}40`, backgroundColor: `${col}10` }}>{e.category}</span>
                                         <h3 className={cn("text-sm font-bold leading-tight", isDone ? "line-through" : "")}>{e.title}</h3>
                                      </div>
                                      <div className="flex items-center gap-1 opacity-1 group-hover:opacity-100 transition-opacity">
                                         <button onClick={() => { setEditEvent(e); setModalOpen(true); }} className="p-2 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-colors"><Edit2 size={14} /></button>
                                         <button onClick={() => remove(e.id, e.title)} className="p-2 rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition-colors"><Trash2 size={14} /></button>
                                      </div>
                                   </div>
                                   
                                   <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500">
                                      <div className="flex items-center gap-1.5">
                                         <Clock size={12} />
                                         {isDone ? 'Finished' : getTimeRemaining(e.deadline)}
                                      </div>
                                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isDone ? '#444' : col }} />
                                   </div>
                                 </motion.div>
                               );
                            })
                          ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                               <CalIcon size={32} className="text-zinc-600 mb-4" />
                               <p className="text-xs font-bold uppercase tracking-widest text-zinc-600">No events scheduled</p>
                            </div>
                          )}
                       </AnimatePresence>
                    </div>

                    <GlowingShadow onClick={() => { setEditEvent(null); setModalOpen(true); }} className="w-full">
                       <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest">
                          <Plus size={16} /> Add Task
                       </div>
                    </GlowingShadow>
                  </motion.div>
               </div>
            </div>
            <Footer />
          </div>
        </main>
      </div>

      <AnimatePresence>
        {modalOpen && <EventModal event={editEvent} onClose={() => { setModalOpen(false); setEditEvent(null); }} />}
      </AnimatePresence>
    </div>
  );
}
