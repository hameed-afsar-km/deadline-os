'use client';

import { useState, useMemo } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useEventStore } from '@/store/useEventStore';
import { EventCard } from '@/components/EventCard';
import { EventModal } from '@/components/EventModal';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { DeadlineEvent } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { isOverdue, isToday, getTimeRemaining } from '@/utils/priority';

type FilterTab = 'all' | 'pending' | 'completed';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',       label: 'Overview' },
  { key: 'pending',   label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
];

export default function Dashboard() {
  const { user } = useUserStore();
  const { events, searchQuery } = useEventStore();
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editingEvent, setEditingEvent] = useState<DeadlineEvent | null>(null);
  const [filter,       setFilter]       = useState<FilterTab>('all');

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
      const matchSearch = e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q);
      const matchFilter = filter === 'all' || e.status === filter;
      return matchSearch && matchFilter;
    }),
  [events, searchQuery, filter]);

  const openEdit  = (e: DeadlineEvent) => { setEditingEvent(e); setModalOpen(true); };
  const openCreate = () => { setEditingEvent(null); setModalOpen(true); };
  const closeModal = () => { setEditingEvent(null); setModalOpen(false); };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#030303] text-white">
      <Navbar onMenuToggle={() => setSidebarOpen(s => !s)} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onCreateEvent={openCreate} />

        {/* Dynamic Background Blurs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
          <div className="absolute top-[40%] -left-[10%] w-[35%] h-[35%] bg-purple-500/10 blur-[120px] rounded-full" />
        </div>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 no-sb relative z-10">
          <div className="max-w-[1400px] mx-auto space-y-12">
            
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center gap-2 mb-2 text-indigo-400">
                  <Sparkles size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Dashboard Overview</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                  Welcome, <span className="text-grad">{user?.displayName?.split(' ')[0] || 'User'}</span>
                </h1>
                <p className="text-zinc-500 mt-2 font-medium">You have {stats.pending} active tasks in your workspace today.</p>
              </motion.div>

              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#030303] glass flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-indigo-500/20" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-[#030303] glass flex items-center justify-center text-[10px] font-bold text-zinc-400">+4</div>
                </div>
                <button onClick={openCreate} className="px-6 py-3 rounded-2xl grad-accent text-sm font-bold shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-all flex items-center gap-2">
                  <Plus size={18} /> New Task
                </button>
              </div>
            </header>

            {/* Featured Section: Featured Task + Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Highlight Card */}
              <div className="lg:col-span-8">
                <AnimatePresence mode="wait">
                  {nextUp ? (
                    <motion.div
                      key={nextUp.id}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      className="glass-hi p-8 md:p-10 rounded-[32px] h-full flex flex-col justify-between relative overflow-hidden group border-white/10 shadow-2xl"
                    >
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full group-hover:scale-125 transition-transform duration-1000" />
                      
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest border border-rose-500/20">Urgent</span>
                          <span className="px-3 py-1 rounded-full bg-white/5 text-zinc-400 text-[10px] font-black uppercase tracking-widest">{nextUp.category}</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight max-w-2xl">{nextUp.title}</h2>
                      </div>

                      <div className="flex flex-wrap items-end justify-between gap-8 mt-12 pb-2">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-zinc-500">
                            <Clock size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Time Remaining</span>
                          </div>
                          <p className="text-4xl font-extrabold tracking-tighter tabular-nums">{getTimeRemaining(nextUp.deadline)}</p>
                        </div>
                        <button onClick={() => openEdit(nextUp)} className="px-8 py-4 rounded-2xl bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-colors shadow-xl">
                          Manage Task
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="glass p-12 rounded-[32px] h-full flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                        <CheckCircle2 size={32} />
                      </div>
                      <h3 className="text-2xl font-bold">Inbox Cleared</h3>
                      <p className="text-zinc-500 mt-2 max-w-sm font-medium">You&apos;ve completed all scheduled tasks. Take a moment to breathe or plan your next move.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Stats Card */}
              <div className="lg:col-span-4 grid grid-cols-1 gap-8">
                <div className="glass p-8 rounded-[32px] flex flex-col justify-between border-white/5 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Workspace Progress</span>
                    <span className="text-2xl font-black text-white">{pct}%</span>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                        className="absolute h-full grad-accent rounded-full" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                        <p className="text-2xl font-bold">{stats.pending}</p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Pending</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                        <p className="text-2xl font-bold text-rose-500">{stats.overdue}</p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Overdue</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <section className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-2xl border border-white/5 shadow-inner">
                  {FILTER_TABS.map(({ key, label }) => (
                    <button key={key} onClick={() => setFilter(key)}
                      className={cn(
                        'px-6 py-2.5 rounded-[14px] text-xs font-bold transition-all',
                        filter === key ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-white'
                      )}>
                      {label}
                    </button>
                  ))}
                </div>
                {searchQuery && (
                  <p className="text-xs font-medium text-zinc-500">
                    Showing results for &ldquo;<span className="text-white font-bold">{searchQuery}</span>&rdquo;
                  </p>
                )}
              </div>

              <AnimatePresence mode="popLayout">
                {displayed.length > 0 ? (
                  <motion.div
                    layout
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-10"
                  >
                    {displayed.map(e => (
                      <EventCard key={e.id} event={e} onEdit={openEdit} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-32 rounded-[32px] glass-hi border-white/5"
                  >
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-zinc-600 mb-6">
                      <LayoutGrid size={32} />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-xl font-bold">No tasks found</p>
                      <p className="text-zinc-500 font-medium">{searchQuery ? 'Adjust your search or filters' : 'Try adding a new task to get started'}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {modalOpen && <EventModal event={editingEvent} onClose={closeModal} />}
      </AnimatePresence>
    </div>
  );
}
