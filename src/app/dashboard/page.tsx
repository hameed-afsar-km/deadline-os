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
import { Plus, Sparkles } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

function countdown(dl: unknown): string {
  try {
    const d = dl instanceof Timestamp ? dl.toDate() : new Date(dl as string);
    const ms = d.getTime() - Date.now();
    if (ms <= 0) return 'OVERDUE';
    const h = Math.floor(ms / 3_600_000), dy = Math.floor(h / 24);
    return dy > 0 ? `${dy}D ${h % 24}H` : `${h}H ${Math.floor((ms % 3_600_000) / 60_000)}M`;
  } catch { return '--'; }
}

const STATUS_F = [{ v: 'all', l: 'All' }, { v: 'pending', l: 'Pending' }, { v: 'completed', l: 'Done' }];
const CATS = ['Study', 'Hackathon', 'Submission', 'Personal', 'Exam'];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUserStore();
  const { events, setEvents, filteredEvents, filterCategory, filterStatus, setFilterCategory, setFilterStatus } = useEventStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<DeadlineEvent | null>(null);

  useEffect(() => { if (!authLoading && !user) router.replace('/login'); }, [user, authLoading, router]);
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToEvents(user.uid, setEvents);
    return () => unsub();
  }, [user, setEvents]);

  if (authLoading) return <Spinner />;
  if (!user) return null;

  const displayed = filteredEvents();
  const todayEvs = events.filter(e => isToday(e) && e.status === 'pending');
  const overdueEvs = events.filter(e => isOverdue(e));

  const focus = events.filter(e => e.status === 'pending').sort((a, b) => {
    const ord = { high: 0, medium: 1, low: 2, auto: 3 } as const;
    const pa = ord[getEffectivePriority(a) as keyof typeof ord] ?? 3;
    const pb = ord[getEffectivePriority(b) as keyof typeof ord] ?? 3;
    if (pa !== pb) return pa - pb;
    const da = a.deadline instanceof Timestamp ? a.deadline.toDate() : new Date(a.deadline as string);
    const db = b.deadline instanceof Timestamp ? b.deadline.toDate() : new Date(b.deadline as string);
    return da.getTime() - db.getTime();
  })[0];

  const openCreate = () => { setEditEvent(null); setModalOpen(true); };
  const openEdit = (ev: DeadlineEvent) => { setEditEvent(ev); setModalOpen(true); };

  const hr = new Date().getHours();
  const greeting = hr < 12 ? 'morning' : hr < 17 ? 'afternoon' : 'evening';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onMenuToggle={() => setSidebarOpen(o => !o)} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden w-full max-w-[1600px] mx-auto">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onCreateEvent={openCreate} />

        <main className="flex-1 overflow-y-auto px-5 md:px-12 py-10 no-sb">

          {/* Masthead */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.3em] mb-1"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-3)' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <h1 className="text-5xl md:text-7xl font-normal tracking-tight leading-none"
                  style={{ fontFamily: 'var(--font-serif)' }}>
                  Good {greeting},<br />
                  <em style={{ color: 'var(--red)' }}>{user.displayName?.split(' ')[0] ?? 'there'}.</em>
                </h1>
              </div>
              <motion.button
                whileHover={{ y: -2, boxShadow: '0 4px 0 rgba(100,10,0,0.35), 0 8px 20px rgba(200,34,10,0.2)' }}
                whileTap={{ y: 1, boxShadow: '0 1px 0 rgba(100,10,0,0.4)' }}
                onClick={openCreate}
                className="btn-red hidden sm:flex px-5 py-3 text-sm shrink-0 mt-2 items-center gap-2">
                <Plus size={16} /> New Deadline
              </motion.button>
            </div>
          </motion.div>

          {/* Priority Focus — large editorial block */}
          {focus && (
            <motion.section
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 }}
              className="paper-card mb-10 relative overflow-hidden"
              style={{ borderRadius: '3px' }}>
              <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'var(--red)' }} />
              <div className="p-8 md:p-12">
                <p className="text-[10px] font-bold uppercase tracking-[.3em] mb-5 flex items-center gap-2"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>
                  ❶ Priority Focus
                </p>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h2 className="text-4xl md:text-6xl font-normal tracking-tight mb-4 leading-tight"
                      style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}>
                      {focus.title}
                    </h2>
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>
                        {countdown(focus.deadline)}
                      </span>
                      <span className="tag-ink">{focus.category}</span>
                    </div>
                  </div>
                  <motion.button whileHover={{ y: -2 }} whileTap={{ y: 1 }}
                    onClick={() => openEdit(focus)}
                    className="btn-ink px-6 py-3 text-sm shrink-0">
                    View & edit →
                  </motion.button>
                </div>
              </div>
            </motion.section>
          )}

          {/* Status summary bar */}
          {(todayEvs.length > 0 || overdueEvs.length > 0) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .2 }}
              className="flex items-center gap-6 mb-10 p-4 border-l-4"
              style={{ borderColor: 'var(--amber)', background: 'rgba(179,84,0,.05)' }}>
              {overdueEvs.length > 0 && <p className="text-sm font-semibold" style={{ color: 'var(--red)' }}>⚡ {overdueEvs.length} overdue</p>}
              {todayEvs.length > 0 && <p className="text-sm font-semibold" style={{ color: 'var(--amber)' }}>📅 {todayEvs.length} due today</p>}
            </motion.div>
          )}

          {/* Queue */}
          <div>
            {/* Queue header + filters */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b"
              style={{ borderColor: 'var(--ink-5)' }}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.3em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-3)' }}>§ Queue</p>
                <h2 className="text-2xl font-normal" style={{ fontFamily: 'var(--font-serif)' }}>Active Deadlines</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {/* Status */}
                <div className="flex gap-0 border border-[var(--ink-5)] rounded-sm overflow-hidden">
                  {STATUS_F.map(({ v, l }) => (
                    <motion.button key={v} whileTap={{ scale: .95 }}
                      onClick={() => setFilterStatus(v)}
                      className="px-3 py-1.5 text-xs font-bold transition-colors"
                      style={filterStatus === v
                        ? { background: 'var(--ink)', color: 'var(--bg)', fontFamily: 'var(--font-mono)' }
                        : { background: 'transparent', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                      {l}
                    </motion.button>
                  ))}
                </div>
                {/* Category */}
                <div className="flex gap-0 border border-[var(--ink-5)] rounded-sm overflow-hidden">
                  <motion.button whileTap={{ scale: .95 }}
                    onClick={() => setFilterCategory('all')}
                    className="px-3 py-1.5 text-xs font-bold transition-colors"
                    style={filterCategory === 'all'
                      ? { background: 'var(--ink)', color: 'var(--bg)', fontFamily: 'var(--font-mono)' }
                      : { background: 'transparent', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                    All
                  </motion.button>
                  {CATS.map(cat => (
                    <motion.button key={cat} whileTap={{ scale: .95 }}
                      onClick={() => setFilterCategory(cat)}
                      className="px-3 py-1.5 text-xs font-bold transition-colors"
                      style={filterCategory === cat
                        ? { background: 'var(--ink)', color: 'var(--bg)', fontFamily: 'var(--font-mono)' }
                        : { background: 'transparent', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {displayed.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="paper-card py-24 flex flex-col items-center text-center" style={{ borderRadius: '3px' }}>
                  <Sparkles size={36} className="mb-4" style={{ color: 'var(--ink-4)' }} />
                  <h3 className="text-3xl font-normal mb-3" style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}>Empty queue.</h3>
                  <p className="text-sm mb-8 max-w-xs" style={{ color: 'var(--ink-2)' }}>Your momentum is clear. Add a deadline to build it back.</p>
                  <motion.button whileHover={{ y: -2 }} whileTap={{ y: 1 }}
                    onClick={openCreate} className="btn-red px-6 py-3 text-sm">
                    <Plus size={16} /> Add deadline
                  </motion.button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayed.map(e => <EventCard key={e.id} event={e} onEdit={openEdit} />)}
                </div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {modalOpen && <EventModal event={editEvent} onClose={() => { setModalOpen(false); setEditEvent(null); }} />}
      </AnimatePresence>
    </div>
  );
}

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-sm flex items-center justify-center text-white font-bold mono" style={{ background: 'var(--red)' }}>D</div>
        <p className="text-[10px] font-bold uppercase tracking-[.3em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-3)' }}>Loading workspace...</p>
      </div>
    </div>
  );
}
