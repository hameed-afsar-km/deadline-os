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
import { Plus, Loader2, Flame, LayoutGrid, Clock, AlertCircle, CheckCircle } from 'lucide-react';
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

  const STATS = [
    { label: 'Total',   val: events.length,        icon: LayoutGrid,   accent: 'var(--accent-2)', bg: 'rgba(26,26,255,0.06)',   border: 'rgba(26,26,255,0.2)' },
    { label: 'Today',   val: todayEvents.length,   icon: Clock,        accent: 'var(--ink)',        bg: 'var(--white)',           border: 'var(--border)' },
    { label: 'Overdue', val: overdueEvents.length, icon: AlertCircle,  accent: 'var(--accent)',    bg: 'rgba(255,85,51,0.06)',   border: 'rgba(255,85,51,0.2)' },
    { label: 'Done',    val: `${completionPct}%`,  icon: CheckCircle,  accent: 'var(--accent-3)',  bg: 'rgba(0,200,150,0.06)',   border: 'rgba(0,200,150,0.2)' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ color: 'var(--ink)' }}>
      <Navbar onMenuToggle={() => setSidebarOpen((o) => !o)} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onCreateEvent={openCreate} />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-8 space-y-8">
          <div className="max-w-[1400px] mx-auto space-y-8">

            {/* ── Header ───────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 pb-6"
              style={{ borderColor: 'var(--border)' }}
            >
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--ink-4)' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <h1 className="font-display font-black tracking-tight leading-none" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: 'var(--ink)' }}>
                  {greeting}, {user.displayName?.split(' ')[0] ?? 'there'}.
                </h1>
                <p className="text-sm font-bold mt-2" style={{ color: overdueEvents.length ? 'var(--accent)' : 'var(--ink-4)' }}>
                  {overdueEvents.length > 0
                    ? `${overdueEvents.length} overdue — needs attention.`
                    : todayEvents.length > 0
                    ? `${todayEvents.length} due today.`
                    : 'All caught up. Great work.'}
                </p>
              </div>
              <motion.button
                whileHover={{ x: -2, y: -2, boxShadow: '4px 4px 0 var(--ink)' }}
                whileTap={{ x: 0, y: 0, boxShadow: 'none' }}
                onClick={openCreate}
                className="hidden sm:inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black text-white border-2 shrink-0"
                style={{ background: 'var(--ink)', borderColor: 'var(--ink)' }}
              >
                <Plus size={16} /> New Deadline
              </motion.button>
            </motion.div>

            {/* ── Top Bento: Focus + Stats ─────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

              {/* Focus */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="col-span-1 lg:col-span-8 rounded-2xl border-2 p-7 relative overflow-hidden"
                style={{ borderColor: 'var(--ink)', background: 'var(--white)' }}
              >
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-[80px] pointer-events-none" style={{ background: 'var(--paper)' }} />

                <div className="flex items-center gap-2.5 mb-5">
                  <div className="p-2 rounded-xl border-2" style={{ borderColor: 'var(--border)', background: 'var(--paper)' }}>
                    <Flame size={16} style={{ color: 'var(--accent)' }} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--ink-4)' }}>Priority Focus</span>
                </div>

                {focusEvent ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                    <div>
                      <h2 className="font-display font-black text-2xl md:text-3xl mb-3" style={{ color: 'var(--ink)' }}>
                        {focusEvent.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 text-sm font-semibold" style={{ color: 'var(--ink-4)' }}>
                        <span className="tag text-[11px]" style={{ color: 'var(--ink-3)', borderColor: 'var(--border)' }}>{focusEvent.category}</span>
                        <span className="flex items-center gap-1.5 font-black" style={{ color: 'var(--accent)' }}>
                          <Clock size={14} /> {fmtCountdown(focusEvent.deadline)} remaining
                        </span>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ x: -2, y: -2, boxShadow: '4px 4px 0 var(--ink)' }}
                      whileTap={{ x: 0, y: 0, boxShadow: 'none' }}
                      onClick={() => openEdit(focusEvent)}
                      className="px-6 py-3 rounded-xl text-sm font-black border-2 whitespace-nowrap shrink-0"
                      style={{ borderColor: 'var(--ink)', color: 'var(--ink)', background: 'var(--paper)' }}
                    >
                      Act now →
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <CheckCircle size={22} style={{ color: 'var(--accent-3)' }} />
                    <span className="font-bold" style={{ color: 'var(--ink-3)' }}>All priorities cleared — excellent momentum.</span>
                  </div>
                )}
              </motion.div>

              {/* Stats 2×2 */}
              <div className="col-span-1 lg:col-span-4 grid grid-cols-2 gap-4">
                {STATS.map(({ label, val, icon: Icon, accent, bg, border }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
                    whileHover={{ y: -4, x: -2, boxShadow: '4px 4px 0 var(--ink)' }}
                    className="rounded-2xl p-5 border-2 flex flex-col gap-3 cursor-default"
                    style={{ background: bg, borderColor: border }}
                  >
                    <Icon size={22} style={{ color: accent }} />
                    <div>
                      <div className="font-display font-black text-3xl" style={{ color: accent }}>{val}</div>
                      <div className="text-[10px] font-extrabold uppercase tracking-widest mt-1" style={{ color: 'var(--ink-4)' }}>{label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── Event Grid ───────────────────────────── */}
            <div className="rounded-2xl border-2 p-6" style={{ borderColor: 'var(--border)', background: 'var(--paper-2)' }}>
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
                <h2 className="font-display font-black text-2xl" style={{ color: 'var(--ink)' }}>Active Queue</h2>
                <div className="flex flex-wrap gap-2">
                  <div className="flex gap-1 p-1 rounded-xl border-2" style={{ borderColor: 'var(--border)', background: 'var(--white)' }}>
                    {CATS.map((cat) => (
                      <motion.button
                        key={cat}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setFilterCategory(cat)}
                        className="px-3 py-1.5 rounded-lg text-xs font-black transition-all"
                        style={
                          filterCategory === cat
                            ? { background: 'var(--ink)', color: '#fff' }
                            : { color: 'var(--ink-4)' }
                        }
                      >
                        {cat}
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex gap-1 p-1 rounded-xl border-2" style={{ borderColor: 'var(--border)', background: 'var(--white)' }}>
                    {STATUSES.map((s) => (
                      <motion.button
                        key={s}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setFilterStatus(s)}
                        className="px-3 py-1.5 rounded-lg text-xs font-black transition-all"
                        style={
                          filterStatus === s
                            ? { background: 'var(--accent)', color: '#fff' }
                            : { color: 'var(--ink-4)' }
                        }
                      >
                        {s}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <AnimatePresence mode="popLayout">
                {displayed.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="py-24 flex flex-col items-center justify-center text-center rounded-2xl border-2"
                    style={{ borderColor: 'var(--border)', background: 'var(--white)' }}
                  >
                    <LayoutGrid size={52} className="mb-5 opacity-20" />
                    <p className="font-display font-bold text-xl" style={{ color: 'var(--ink-3)' }}>No deadlines here.</p>
                    <p className="text-sm font-medium mt-2 mb-6" style={{ color: 'var(--ink-4)' }}>Adjust filters or create something new.</p>
                    <motion.button
                      whileHover={{ y: -2, x: -2, boxShadow: '4px 4px 0 var(--ink)' }}
                      whileTap={{ y: 0, x: 0, boxShadow: 'none' }}
                      onClick={openCreate}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white border-2"
                      style={{ background: 'var(--ink)', borderColor: 'var(--ink)' }}
                    >
                      <Plus size={16} /> Create Deadline
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
        <div className="w-12 h-12 rounded-xl border-4 border-t-ink animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--ink)' }} />
        <p className="font-bold text-sm" style={{ color: 'var(--ink-4)' }}>Loading DeadlineOS...</p>
      </div>
    </div>
  );
}
