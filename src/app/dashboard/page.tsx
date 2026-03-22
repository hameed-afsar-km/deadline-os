'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useEventStore } from '@/store/useEventStore';
import { EventCard } from '@/components/EventCard';
import { EventModal } from '@/components/EventModal';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { DeadlineEvent } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, CheckCircle2, Clock, Sparkles, Filter, Search, X, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';
import { isOverdue, isToday, getTimeRemaining, getDetailedCountdown } from '@/utils/priority';
import { GlowingShadow } from '@/components/ui/glowing-shadow';
import { Footer } from '@/components/Footer';

type FilterTab = 'all' | 'pending' | 'completed';
const CATEGORIES = [
  'All Units',
  'Hackathon',
  'Assignment',
  'Test',
  'Project',
  'Seminar',
  'Application Deadline',
  'Competition',
  'Fee',
  'Meeting',
  'Internship',
  'Custom'
];

function CountdownTimer({ deadline }: { deadline: any }) {
  const [time, setTime] = useState(getDetailedCountdown(deadline));

  useEffect(() => {
    const it = setInterval(() => setTime(getDetailedCountdown(deadline)), 1000);
    return () => clearInterval(it);
  }, [deadline]);

  return (
    <div className="flex gap-4 md:gap-8">
      {[
        { label: 'Days', val: time.days },
        { label: 'Hours', val: time.hours },
        { label: 'Mins', val: time.mins },
        { label: 'Secs', val: time.secs },
      ].map((item) => (
        <div key={item.label} className="flex flex-col">
          <span className="text-3xl md:text-5xl font-black tabular-nums tracking-tighter">
            {String(item.val).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useUserStore();
  const { events, searchQuery } = useEventStore();

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editingEvent, setEditingEvent] = useState<DeadlineEvent | null>(null);
  const [filter,       setFilter]       = useState<FilterTab>('all');
  const [catFilter,    setCatFilter]    = useState('all');

  const stats = useMemo(() => ({
    total:     events.length,
    overdue:   events.filter(e => isOverdue(e)).length,
    today:     events.filter(e => isToday(e) && e.status === 'pending').length,
    completed: events.filter(e => e.status === 'completed').length,
    pending:   events.filter(e => e.status === 'pending').length,
  }), [events]);

  const pct = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  const nextUp = useMemo(() =>
    events
      .filter(e => e.status === 'pending')
      .sort((a, b) => {
        const da = a.deadline instanceof Object && 'toDate' in a.deadline ? a.deadline.toDate() : new Date(a.deadline as string);
        const db = b.deadline instanceof Object && 'toDate' in b.deadline ? b.deadline.toDate() : new Date(b.deadline as string);
        return da.getTime() - db.getTime();
      })[0],
  [events]);

  const displayed = useMemo(() =>
    events.filter(e => {
      const q = searchQuery.toLowerCase();
      const matchSearch = e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
      const matchFilter = filter === 'all' || e.status === filter;
      const matchCat = catFilter === 'all' || e.category.toLowerCase() === catFilter.toLowerCase();
      return matchSearch && matchFilter && matchCat;
    }),
  [events, searchQuery, filter, catFilter]);

  const openEdit  = (e: DeadlineEvent) => { setEditingEvent(e); setModalOpen(true); };
  const openCreate = () => { setEditingEvent(null); setModalOpen(true); };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#000000]">
      <Loader2 size={32} className="animate-spin text-indigo-500" />
    </div>
  );
  if (!user) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#000000] text-zinc-100 relative selection:bg-white/20">
      {/* Subtle modern background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[50vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-[#000000]/0 to-transparent" />
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onCreateEvent={openCreate} />

        <div className="flex-1 flex flex-col min-w-0">
          <div className="w-full pt-6 px-6 md:pt-8 md:px-10 flex-shrink-0 relative z-20">
            <Navbar onMenuToggle={() => setSidebarOpen(s => !s)} sidebarOpen={sidebarOpen} />
          </div>

          <main className="flex-1 overflow-y-auto p-6 md:p-10 pt-10 md:pt-12 no-sb relative z-10">
          <div className="max-w-[1400px] mx-auto space-y-16">
            
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
                  <div className="flex items-center gap-2 mb-4 text-zinc-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className="text-xs font-semibold tracking-widest uppercase">Overview Panel</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter text-white">
                    Dashboard
                  </h1>
               </motion.div>

               <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="bg-[#0A0A0A] p-4 rounded-xl border border-white/10 flex items-center gap-6 shadow-sm">
                     <div className="space-y-1.5">
                        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Active Threads</p>
                        <p className="text-2xl font-semibold leading-none">{stats.pending}</p>
                     </div>
                     <div className="w-px h-10 bg-white/[0.08]" />
                     <div className="space-y-1.5 min-w-[120px]">
                        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest flex justify-between">
                           Completion <span>{pct}%</span>
                        </p>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-white transition-all duration-1000" style={{ width: `${pct}%` }} />
                        </div>
                     </div>
                  </div>
                  <button onClick={openCreate} className="h-[76px] px-6 rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors shadow-sm flex items-center justify-center gap-2 text-sm font-semibold">
                    <Plus size={18} /> New Task
                  </button>
               </div>
            </header>

            {/* Target Countdown Section */}
            <AnimatePresence mode="wait">
              {nextUp && (
                <motion.section 
                  initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                  className="relative glass-hi p-8 md:p-16 rounded-[48px] border-white/10 overflow-hidden shadow-[0_64px_128px_rgba(0,0,0,0.8)]"
                >
                   {/* Background Graphics */}
                   <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
                       <div className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.03)_0%,_transparent_70%)]" />
                    </div>

                   <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
                      <div className="space-y-8">
                         <div className="space-y-3">
                            <span className="px-3 py-1 rounded-md bg-white/10 text-white text-[10px] font-semibold tracking-widest uppercase border border-white/5">Active Target</span>
                            <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-tight text-white">{nextUp.title}</h2>
                         </div>
                         <CountdownTimer deadline={nextUp.deadline} />
                      </div>
                      <div className="flex justify-end">
                         <button onClick={() => openEdit(nextUp)} className="px-8 py-4 rounded-xl bg-white text-black text-xs font-bold tracking-wide hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-3">
                            Manage Task <ArrowRight size={16} />
                         </button>
                      </div>
                   </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Filter & Grid Section */}
            <section className="space-y-10">
               <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                  <div className="flex flex-wrap items-center gap-4">
                     <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-2xl border border-white/5">
                        {['all', 'pending', 'completed'].map((tab) => (
                           <button key={tab} onClick={() => setFilter(tab as FilterTab)}
                             className={cn(
                               "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                               filter === tab ? "bg-white text-black" : "text-zinc-500 hover:text-white"
                             )}
                           >
                             {tab === 'all' ? 'All Units' : tab === 'pending' ? 'Active' : 'Offline'}
                           </button>
                        ))}
                     </div>

                <select 
                  value={catFilter}
                  onChange={(e) => setCatFilter(e.target.value)}
                  className="pl-10 pr-6 h-11 rounded-2xl glass-hi border-white/10 text-[10px] font-bold uppercase tracking-widest bg-[#0A0A0A] focus:outline-none focus:ring-2 ring-indigo-500/50 appearance-none cursor-pointer"
                >
                   {CATEGORIES.map(c => <option key={c} value={c === 'All Units' ? 'all' : c}>{c}</option>)}
                </select>
                  </div>

                  <div className="flex items-center gap-4">
                     {searchQuery && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-medium text-zinc-300">
                           Search: {searchQuery}
                        </div>
                     )}
                  </div>
               </div>

               <AnimatePresence mode="popLayout">
                  {displayed.length > 0 ? (
                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {displayed.map(e => <EventCard key={e.id} event={e} onEdit={openEdit} />)}
                    </motion.div>
                  ) : (
                    <div className="py-24 flex flex-col items-center justify-center text-center bg-[#0A0A0A] rounded-[24px] border border-white/[0.05] w-full">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-zinc-600 mb-6"><Filter size={24} /></div>
                        <h3 className="text-lg font-semibold tracking-tight">No Events Found</h3>
                        <p className="text-zinc-500 text-sm max-w-sm mt-2">Adjust your filters or define a new objective to populate your dashboard.</p>
                    </div>
                  )}
               </AnimatePresence>
            </section>
            
            <Footer />
          </div>
        </main>
      </div>
    </div>

      <AnimatePresence>
        {modalOpen && <EventModal event={editingEvent} onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
