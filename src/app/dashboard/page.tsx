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
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar onMenuToggle={() => setSidebarOpen(s => !s)} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onCreateEvent={openCreate} />

        <main className="flex-1 overflow-y-auto p-5 md:p-8 space-y-8 no-sb">

          {/* ── Greeting ── */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
              <span className="text-grad">{user?.displayName?.split(' ')[0] || 'there'}</span> 👋
            </h1>
            <p className="text-sm text-[--c-muted] mt-1 font-medium">
              {stats.pending > 0
                ? `You have ${stats.pending} pending task${stats.pending > 1 ? 's' : ''}${stats.overdue > 0 ? ` — ${stats.overdue} overdue.` : '.'}`
                : 'All caught up! No pending tasks.'}
            </p>
          </motion.div>

          {/* ── Focus Banner ── */}
          <AnimatePresence mode="wait">
            {nextUp && (
              <motion.div
                key={nextUp.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5 }}
                className="glass-hi rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 border border-violet-500/10 relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ background: 'radial-gradient(circle at 0% 50%, #7C3AED, transparent 60%)' }} />
                <div className="space-y-1 z-10">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-violet-400">Next Up</p>
                  <h2 className="text-xl font-bold text-white tracking-tight">{nextUp.title}</h2>
                  <p className="text-sm text-[--c-muted] font-medium">{nextUp.category}</p>
                </div>
                <div className="flex items-center gap-4 z-10">
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-white tracking-tighter">{getTimeRemaining(nextUp.deadline)}</p>
                    <p className="text-[0.65rem] font-semibold text-[--c-muted] uppercase tracking-wide">remaining</p>
                  </div>
                  <button onClick={() => openEdit(nextUp)}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white grad-accent hover:opacity-90 transition-opacity glow-accent whitespace-nowrap">
                    View Task
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Stat Cards ── */}
          <motion.div
            variants={staggerList} initial="hidden" animate="show"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {STAT_CARDS.map(({ label, val, icon: Icon, color }) => (
              <motion.div key={label}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
                className="glass-hi rounded-2xl p-5 flex flex-col gap-3 card-lift relative overflow-hidden group"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 80% 20%, ${color}14, transparent 65%)` }} />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[--c-muted] uppercase tracking-wide">{label}</span>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                    <Icon size={15} style={{ color }} />
                  </div>
                </div>
                <p className="text-3xl font-extrabold tracking-tighter text-white">{val}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Completion Progress ── */}
          <div className="glass-hi rounded-2xl p-5 flex items-center gap-5">
            <TrendingUp size={18} className="text-violet-400 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[--c-muted]">Overall progress</span>
                <span className="text-xs font-bold text-white">{pct}%</span>
              </div>
              <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="h-full rounded-full grad-accent"
                />
              </div>
            </div>
            <span className="text-xs text-[--c-muted] font-medium shrink-0">{stats.completed}/{stats.total}</span>
          </div>

          {/* ── Controls ── */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filter tabs */}
            <div className="flex items-center gap-1 glass-hi border border-white/[0.07] rounded-xl p-1">
              {FILTER_TABS.map(({ key, label }) => (
                <button key={key} onClick={() => setFilter(key)}
                  className={cn(
                    'relative px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors',
                    filter === key ? 'text-white' : 'text-[--c-muted] hover:text-white'
                  )}>
                  {filter === key && (
                    <motion.div layoutId="dash-filter-bg" className="absolute inset-0 grad-accent rounded-lg opacity-90" style={{ zIndex: -1 }} />
                  )}
                  {label}
                </button>
              ))}
            </div>

            <button onClick={openCreate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white grad-accent hover:opacity-90 transition-opacity glow-accent">
              <Plus size={16} /> New Task
            </button>
          </div>

          {/* ── Task Grid ── */}
          <AnimatePresence mode="popLayout">
            {displayed.length > 0 ? (
              <motion.div
                key="grid"
                variants={staggerList} initial="hidden" animate="show"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-16"
              >
                {displayed.map(e => (
                  <EventCard key={e.id} event={e} onEdit={openEdit} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-32 gap-5 text-center"
              >
                <div className="w-16 h-16 rounded-2xl glass-hi border border-white/[0.07] flex items-center justify-center text-[--c-muted]">
                  <LayoutGrid size={26} />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">No tasks found</p>
                  <p className="text-sm text-[--c-muted] mt-1">
                    {searchQuery ? 'Try a different search term.' : 'Create your first task to get started.'}
                  </p>
                </div>
                {!searchQuery && (
                  <button onClick={openCreate}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white grad-accent hover:opacity-90 transition-opacity">
                    Create Task
                  </button>
                )}
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
