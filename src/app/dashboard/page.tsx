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
import { Plus, LayoutGrid, AlertTriangle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/utils/cn';
import { isOverdue, isToday } from '@/utils/priority';
import { getTimeRemaining } from '@/utils/priority';

type FilterTab = 'all' | 'pending' | 'completed';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'pending',   label: 'Pending' },
  { key: 'completed', label: 'Completed' },
];

const staggerList = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

export default function Dashboard() {
  const { user } = useUserStore();
  const { events, searchQuery } = useEventStore();
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editingEvent, setEditingEvent] = useState<DeadlineEvent | null>(null);
  const [filter,       setFilter]       = useState<FilterTab>('all');

  /* ── Derived stats ── */
  const stats = useMemo(() => ({
    total:     events.length,
    overdue:   events.filter(e => isOverdue(e)).length,
    today:     events.filter(e => isToday(e) && e.status === 'pending').length,
    completed: events.filter(e => e.status === 'completed').length,
    pending:   events.filter(e => e.status === 'pending').length,
  }), [events]);

  const pct = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  /* ── Next urgent task ── */
  const nextUp = useMemo(() =>
    events
      .filter(e => e.status === 'pending')
      .sort((a, b) => {
        const da = a.deadline instanceof Object && 'toDate' in a.deadline ? a.deadline.toDate() : new Date(a.deadline as string);
        const db = b.deadline instanceof Object && 'toDate' in b.deadline ? b.deadline.toDate() : new Date(b.deadline as string);
        return da.getTime() - db.getTime();
      })[0],
  [events]);

  /* ── Filtered list ── */
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

  const STAT_CARDS = [
    { label: 'Total Tasks',  val: stats.total,     icon: LayoutGrid,     color: '#7C3AED' },
    { label: 'Overdue',      val: stats.overdue,   icon: AlertTriangle,  color: '#F43F5E' },
    { label: 'Due Today',    val: stats.today,     icon: Clock,          color: '#F59E0B' },
    { label: 'Completed',    val: stats.completed, icon: CheckCircle2,   color: '#10B981' },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#050508]">
      <Navbar onMenuToggle={() => setSidebarOpen(s => !s)} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onCreateEvent={openCreate} />

        {/* Global HUD Background Glows */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px]" />
        </div>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 no-sb relative z-10">

          {/* ── Greeting & Stats Header ── */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-white/[0.05]">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-[0.3em] mb-2 block glow-text">System Initialization Complete</span>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
                WELCOME, <span className="text-grad">{user?.displayName?.split(' ')[0] || 'ADMIN'}</span>
              </h1>
              <p className="text-[11px] text-zinc-500 mt-2 font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Connectivity: Firebase Live · Latency: 24ms
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-8 px-6 py-3 glass rounded-xl border-cyan-500/10 shadow-lg shadow-cyan-500/5">
              <div className="text-center">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Queue</p>
                <p className="text-xl font-black text-white">{stats.pending}</p>
              </div>
              <div className="w-[1px] h-8 bg-white/[0.05]" />
              <div className="text-center">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Critical</p>
                <p className="text-xl font-black text-rose-500">{stats.overdue}</p>
              </div>
              <div className="w-[1px] h-8 bg-white/[0.05]" />
              <div className="text-center">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Efficiency</p>
                <p className="text-xl font-black text-emerald-400">{pct}%</p>
              </div>
            </motion.div>
          </div>

          {/* ── Focus Bento Grid ── */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Urgent Task Widget */}
            <div className="xl:col-span-8">
              <AnimatePresence mode="wait">
                {nextUp ? (
                  <motion.div
                    key={nextUp.id}
                    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                    className="glass hud-border p-8 rounded-2xl h-full flex flex-col justify-between relative overflow-hidden group shadow-2xl"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[40px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5">
                        <div className="px-2 py-0.5 rounded-sm bg-rose-500/10 border border-rose-500/20 text-[9px] font-black text-rose-400 uppercase tracking-widest">Immediate Criticality</div>
                        <div className="px-2 py-0.5 rounded-sm bg-white/5 text-[9px] font-black text-zinc-400 uppercase tracking-widest">{nextUp.category}</div>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-tight max-w-2xl">{nextUp.title}</h2>
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-6 mt-10">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-cyan-500" />
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Temporal Remaining</p>
                        </div>
                        <p className="text-4xl font-black text-white tracking-tighter tabular-nums drop-shadow-xl">{getTimeRemaining(nextUp.deadline)}</p>
                      </div>
                      <button onClick={() => openEdit(nextUp)}
                        className="px-8 py-3 rounded-lg text-xs font-black text-white grad-accent hover:scale-[1.02] active:scale-[0.98] transition-all glow-accent uppercase tracking-[0.2em]">
                        View Protocol
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="glass hud-border p-12 rounded-2xl h-full flex flex-col items-center justify-center text-center">
                    <CheckCircle2 size={40} className="text-emerald-500 mb-4 opacity-50" />
                    <p className="text-lg font-bold text-white">All Objectives Cleared</p>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2 font-bold">System in standby mode · awaiting NEW_INPUT</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Overall Efficiency Widget */}
            <div className="xl:col-span-4">
              <div className="glass hud-border p-8 rounded-2xl h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp size={16} className="text-cyan-500" />
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Resource Utilization</p>
                  </div>
                  <div className="relative w-40 h-40 mx-auto">
                    {/* SVG Circular Progress */}
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="80" cy="80" r="70" className="fill-none stroke-white/[0.05] stroke-[8]" />
                      <motion.circle 
                        cx="80" cy="80" r="70" 
                        fill="none" stroke="url(#cyan-grad)" strokeWidth="12" strokeLinecap="round"
                        initial={{ strokeDasharray: "0 440" }}
                        animate={{ strokeDasharray: `${(pct / 100) * 440} 440` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      />
                      <defs>
                        <linearGradient id="cyan-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#06B6D4" />
                          <stop offset="100%" stopColor="#6366F1" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-4xl font-black text-white tracking-tighter tabular-nums">{pct}%</p>
                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">SYNCED</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-8">
                  <span>Processed: {stats.completed}</span>
                  <div className="w-1 h-1 rounded-full bg-zinc-700" />
                  <span>Remaining: {stats.pending}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Navigation & Control Panel ── */}
          <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-white/[0.05]">
            <div className="flex items-center gap-1.5 p-1 glass border-white/[0.05] rounded-xl overflow-hidden">
              {FILTER_TABS.map(({ key, label }) => (
                <button key={key} onClick={() => setFilter(key)}
                  className={cn(
                    'relative px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all',
                    filter === key ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                  )}>
                  {filter === key && (
                    <motion.div layoutId="dash-filter-bg" className="absolute inset-0 bg-white/[0.06] border border-white/5 rounded-lg" style={{ zIndex: -1 }} />
                  )}
                  {label}
                </button>
              ))}
            </div>

            <button onClick={openCreate}
              className="group flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black text-white grad-accent hover:scale-[1.02] transition-all glow-accent uppercase tracking-[0.2em]">
              <Plus size={14} /> 
              <span>Create Protocol</span>
              <div className="w-[1px] h-3 bg-white/20 group-hover:bg-white/40 transition-colors" />
              <span className="text-[8px] opacity-70">ADD_NEW</span>
            </button>
          </div>

          {/* ── Data Matrix (Items) ── */}
          <AnimatePresence mode="popLayout">
            {displayed.length > 0 ? (
              <motion.div
                key="grid"
                variants={staggerList} initial="hidden" animate="show"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20"
              >
                {displayed.map(e => (
                  <EventCard key={e.id} event={e} onEdit={openEdit} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 gap-6 glass hud-border rounded-2xl"
              >
                <div className="w-16 h-16 rounded-xl border border-white/[0.05] flex items-center justify-center text-zinc-600 bg-white/[0.02]">
                  <LayoutGrid size={24} />
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-white uppercase tracking-tight">Data Matrix Empty</p>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-2">
                    {searchQuery ? 'Search query yielded zero results' : 'Awaiting initial data entry sequence'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {modalOpen && <EventModal event={editingEvent} onClose={closeModal} />}
      </AnimatePresence>
    </div>
  );
}
