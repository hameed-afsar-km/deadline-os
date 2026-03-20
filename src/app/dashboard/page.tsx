'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { useEventStore } from '@/store/useEventStore';
import { subscribeToEvents } from '@/lib/firestore';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { EventCard } from '@/components/EventCard';
import { EventModal } from '@/components/EventModal';
import { DeadlineEvent } from '@/types';
import { isOverdue, isToday, getEffectivePriority } from '@/utils/priority';
import { Plus, Loader2, LayoutGrid, Clock, AlertCircle, CheckCircle, Sparkles, SortAsc, Flame } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

function fmtCountdown(deadline: unknown): string {
  try {
    const d  = deadline instanceof Timestamp ? deadline.toDate() : new Date(deadline as string);
    const ms = d.getTime() - Date.now();
    if (ms <= 0) return 'Overdue';
    const h  = Math.floor(ms / 3_600_000);
    const dy = Math.floor(h / 24);
    return dy > 0 ? `${dy}d ${h % 24}h` : `${h}h`;
  } catch { return '--'; }
}

const CATS     = ['all', 'Study', 'Hackathon', 'Submission', 'Personal', 'Exam'];
const STATUSES = ['all', 'pending', 'completed'];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUserStore();
  const { events, setEvents, filteredEvents, filterCategory, filterStatus, setFilterCategory, setFilterStatus } = useEventStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editEvent,   setEditEvent]   = useState<DeadlineEvent | null>(null);

  useEffect(() => { if (!authLoading && !user) router.replace('/login'); }, [user, authLoading, router]);
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToEvents(user.uid, setEvents);
    return () => unsub();
  }, [user, setEvents]);

  if (authLoading) return <LoadingScreen />;
  if (!user) return null;

  const displayed     = filteredEvents();
  const todayEvents   = events.filter((e) => isToday(e) && e.status === 'pending');
  const overdueEvents = events.filter((e) => isOverdue(e));
  const completionPct = events.length
    ? Math.round((events.filter((e) => e.status === 'completed').length / events.length) * 100) : 0;

  // The single most pressing thing to do right now
  const focusEvent = events
    .filter((e) => e.status === 'pending')
    .sort((a, b) => {
      const ord = { high: 0, medium: 1, low: 2, auto: 3 } as const;
      const pa  = ord[getEffectivePriority(a) as keyof typeof ord] ?? 3;
      const pb  = ord[getEffectivePriority(b) as keyof typeof ord] ?? 3;
      if (pa !== pb) return pa - pb;
      const da = a.deadline instanceof Timestamp ? a.deadline.toDate() : new Date(a.deadline as string);
      const db = b.deadline instanceof Timestamp ? b.deadline.toDate() : new Date(b.deadline as string);
      return da.getTime() - db.getTime();
    })[0];

  const openCreate = () => { setEditEvent(null); setModalOpen(true); };
  const openEdit   = (ev: DeadlineEvent) => { setEditEvent(ev); setModalOpen(true); };

  const hora     = new Date().getHours();
  const greeting = hora < 12 ? 'Good morning' : hora < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onMenuToggle={() => setSidebarOpen((o) => !o)} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden relative z-10 w-full max-w-[1600px] mx-auto">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onCreateEvent={openCreate} />

        <main className="flex-1 overflow-y-auto px-5 md:px-10 py-10 space-y-10 hide-scrollbar scroll-smooth relative">
          
          {/* Welcome Area */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
          >
            <div>
              <p className="text-sm font-bold tracking-widest uppercase mb-1.5" style={{ color: 'var(--amber)' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--t0)' }}>
                {greeting}, {user.displayName?.split(' ')[0] ?? 'there'}.
              </h1>
              <p className="text-base font-medium mt-2 max-w-lg" style={{ color: 'var(--t2)' }}>
                {overdueEvents.length > 0
                  ? `You have ${overdueEvents.length} overdue task${overdueEvents.length > 1 ? 's' : ''}. Let's get things back on track.`
                  : todayEvents.length > 0
                  ? `Focus up. You have ${todayEvents.length} deadline${todayEvents.length > 1 ? 's' : ''} due today.`
                  : 'You are all caught up. The day is yours.'}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(245,158,11,0.25)' }}
              whileTap={{ scale: 0.96 }}
              onClick={openCreate}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #B45309)', color: '#0C0A09' }}
            >
              <Plus size={16} /> New Deadline
            </motion.button>
          </motion.div>

          {/* Top Bento Selection */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

            {/* Smart Focus Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="xl:col-span-8 card p-8 relative overflow-hidden"
            >
              {/* Soft glow background */}
              <div
                className="absolute inset-0 z-0 pointer-events-none opacity-20"
                style={{ background: 'radial-gradient(ellipse at bottom right, #F59E0B 0%, transparent 50%)' }}
              />

              <div className="relative z-10 flex flex-col h-full jutsify-between">
                <div className="flex items-center gap-2 mb-6">
                  <Flame size={18} style={{ color: 'var(--amber)' }} fill="var(--amber)" fillOpacity={0.2} />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-amber-500" style={{ color: 'var(--amber)' }}>Absolute Priority</span>
                </div>

                {focusEvent ? (
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-3" style={{ color: 'var(--t0)' }}>
                        {focusEvent.title}
                      </h2>
                      <div className="flex items-center gap-4 text-sm font-medium">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--amber)' }}>
                          <Clock size={14} /> {fmtCountdown(focusEvent.deadline)} remaining
                        </span>
                        <span style={{ color: 'var(--t3)' }}>{focusEvent.category}</span>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openEdit(focusEvent)}
                      className="px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap"
                      style={{ background: 'var(--s3)', color: 'var(--t0)', border: '1px solid var(--b2)' }}
                    >
                      View details
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl" style={{ background: 'rgba(52,211,153,0.1)' }}>
                      <CheckCircle size={28} style={{ color: '#34D399' }} />
                    </div>
                    <div>
                      <p className="text-xl font-bold" style={{ color: 'var(--t0)' }}>Nothing pressing</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--t2)' }}>Your queue is clear.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Stats Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="xl:col-span-4 grid grid-cols-2 gap-4"
            >
              {[
                { label: 'Active', val: events.filter(e => e.status==='pending').length, c: 'var(--cyan)' },
                { label: 'Today',  val: todayEvents.length,                              c: 'var(--amber)' },
                { label: 'Overdue',val: overdueEvents.length,                            c: 'var(--rose)' },
                { label: 'Done',   val: `${completionPct}%`,                             c: 'var(--emerald)' },
              ].map(({ label, val, c }) => (
                <div key={label} className="card p-5 flex flex-col justify-center items-center text-center hover:border-[var(--b2)] group">
                  <span className="text-3xl font-extrabold mb-1 group-hover:scale-110 transition-transform" style={{ color: c }}>{val}</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--t3)' }}>{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Timeline / Event Grid */}
          <div className="pt-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
              <div>
                <h2 className="text-2xl font-extrabold flex items-center gap-2 mb-2" style={{ color: 'var(--t0)' }}>
                  <SortAsc size={20} style={{ color: 'var(--t3)' }} /> The Queue
                </h2>
                <p className="text-sm font-medium" style={{ color: 'var(--t2)' }}>All your tasks, intelligently ordered.</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex p-1 rounded-xl" style={{ background: 'var(--s1)', border: '1px solid var(--b1)' }}>
                  {STATS_FILTER_KEYS.map((s) => (
                    <motion.button
                      key={s.val}
                      whileHover={{ color: 'var(--t0)' }}
                      onClick={() => setFilterStatus(s.val)}
                      className="px-4 py-1.5 text-xs font-bold rounded-lg transition-all"
                      style={
                        filterStatus === s.val
                          ? { background: 'var(--s3)', color: 'var(--amber)' }
                          : { color: 'var(--t3)' }
                      }
                    >
                      {s.label}
                    </motion.button>
                  ))}
                </div>
                <div className="flex p-1 rounded-xl max-w-full overflow-x-auto hide-scrollbar" style={{ background: 'var(--s1)', border: '1px solid var(--b1)' }}>
                  <motion.button
                    onClick={() => setFilterCategory('all')}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0"
                    style={filterCategory === 'all' ? { background: 'var(--s3)', color: 'var(--t0)' } : { color: 'var(--t3)' }}
                  >
                    All
                  </motion.button>
                  {CATS.filter(c => c !== 'all').map((cat) => (
                    <motion.button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0"
                      style={filterCategory === cat ? { background: 'var(--s3)', color: 'var(--t0)' } : { color: 'var(--t3)' }}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid */}
            <AnimatePresence mode="popLayout">
              {displayed.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="card py-24 flex flex-col items-center justify-center text-center"
                >
                  <Sparkles size={48} className="mb-4" style={{ color: 'var(--t4)' }} />
                  <p className="text-lg font-bold mb-1" style={{ color: 'var(--t0)' }}>It's quiet in here.</p>
                  <p className="text-sm font-medium mb-6 max-w-sm" style={{ color: 'var(--t2)' }}>
                    No tasks match your filters, or you haven't created any yet. Want to add something?
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openCreate}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all"
                    style={{ background: 'var(--s3)', color: 'var(--t0)', border: '1px solid var(--b2)' }}
                  >
                    <Plus size={16} /> Add a Deadline
                  </motion.button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {displayed.map((e) => (
                    <EventCard key={e.id} event={e} onEdit={openEdit} />
                  ))}
                </div>
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

const STATS_FILTER_KEYS = [
  { val: 'all',       label: 'All' },
  { val: 'pending',   label: 'Pending' },
  { val: 'completed', label: 'Done' },
];

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
        <p className="text-sm font-bold tracking-widest uppercase" style={{ color: 'var(--t3)' }}>Loading Workspace</p>
      </div>
    </div>
  );
}
