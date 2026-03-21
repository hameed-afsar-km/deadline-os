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
import { Plus, LayoutGrid, CheckCircle2, Clock, Sparkles, Filter, Search, X, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { isOverdue, isToday, getTimeRemaining, getDetailedCountdown } from '@/utils/priority';
import { GlowingShadow } from '@/components/ui/glowing-shadow';
import { Footer } from '@/components/Footer';

type FilterTab = 'all' | 'pending' | 'completed';
const CATEGORIES = ['all', 'hackathons', 'Assignments', 'competitions', 'Test', 'Client', 'Custom'];

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
  const { user } = useUserStore();
  const { events, searchQuery } = useEventStore();
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
      const matchCat = catFilter === 'all' || e.category === catFilter;
      return matchSearch && matchFilter && matchCat;
    }),
  [events, searchQuery, filter, catFilter]);

  const openEdit  = (e: DeadlineEvent) => { setEditingEvent(e); setModalOpen(true); };
  const openCreate = () => { setEditingEvent(null); setModalOpen(true); };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#030303] text-white">
      <Navbar onMenuToggle={() => setSidebarOpen(s => !s)} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onCreateEvent={openCreate} />

        <main className="flex-1 overflow-y-auto p-6 md:p-10 no-sb relative z-10">
          <div className="max-w-[1400px] mx-auto space-y-16">
            
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center gap-2 mb-3 text-indigo-400">
                    <Sparkles size={16} />
                    <span className="text-xs font-black uppercase tracking-[0.3em]">System Overload</span>
                  </div>
                  <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">
                    ENGINEERING <br /> <span className="text-grad">SUCCESS</span>
                  </h1>
               </motion.div>

               <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="glass p-4 rounded-3xl border-white/5 flex items-center gap-6 shadow-2xl">
                     <div className="space-y-1">
                        <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Active Threads</p>
                        <p className="text-2xl font-black">{stats.pending}</p>
                     </div>
                     <div className="w-px h-10 bg-white/10" />
                     <div className="space-y-1">
                        <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Completion</p>
                        <div className="flex items-center gap-2">
                           <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full grad-accent" style={{ width: `${pct}%` }} />
                           </div>
                           <span className="text-sm font-black">{pct}%</span>
                        </div>
                     </div>
                  </div>
                  <GlowingShadow onClick={openCreate}>
                    <div className="flex items-center gap-2.5 text-sm font-black uppercase tracking-widest">
                      <Plus size={20} /> Initialize
                    </div>
                  </GlowingShadow>
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
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-500/[0.03] blur-[160px] rounded-full" />
                      <div className="absolute top-0 right-0 p-12 text-zinc-800 opacity-20"><LayoutGrid size={200} strokeWidth={0.5} /></div>
                   </div>

                   <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
                      <div className="space-y-10">
                         <div className="space-y-4">
                            <span className="px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/20">Active Target</span>
                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">{nextUp.title}</h2>
                         </div>
                         <CountdownTimer deadline={nextUp.deadline} />
                      </div>
                      <div className="flex justify-end">
                         <button onClick={() => openEdit(nextUp)} className="px-10 py-5 rounded-2xl bg-white text-black text-sm font-black uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-2xl flex items-center gap-3 active:scale-95">
                            Modify Parameters <ArrowRight size={18} />
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

                     <div className="relative group">
                        <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <select 
                          value={catFilter}
                          onChange={(e) => setCatFilter(e.target.value)}
                          className="pl-10 pr-6 h-11 rounded-2xl glass-hi border-white/10 text-[10px] font-black uppercase tracking-widest bg-[#0A0A0A] focus:outline-none focus:ring-2 ring-indigo-500/50 appearance-none cursor-pointer"
                        >
                           {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                     </div>
                  </div>

                  <div className="flex items-center gap-4">
                     {searchQuery && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                           Results: {searchQuery}
                        </div>
                     )}
                  </div>
               </div>

               <AnimatePresence mode="popLayout">
                  {displayed.length > 0 ? (
                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {displayed.map(e => <EventCard key={e.id} event={e} onEdit={openEdit} />)}
                    </motion.div>
                  ) : (
                    <div className="py-40 flex flex-col items-center justify-center text-center glass rounded-[40px] border-white/5 w-full">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-zinc-700 mb-8"><Filter size={40} /></div>
                        <h3 className="text-2xl font-black uppercase tracking-widest">No Signals Found</h3>
                        <p className="text-zinc-500 max-w-sm font-medium mt-4 leading-relaxed">Adjust your filters or initiate a new task sequence to populate your workspace.</p>
                    </div>
                  )}
               </AnimatePresence>
            </section>
            
            <Footer />
          </div>
        </main>
      </div>

      <AnimatePresence>
        {modalOpen && <EventModal event={editingEvent} onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
