'use client';

import { useEffect, useState, useRef } from 'react';
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
import { Filter, Sparkles, TrendingUp, AlertCircle, Clock, CheckCircle2, Plus, Flame } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { cn } from '@/utils/cn';

const CATEGORIES = ['all', 'Study', 'Hackathon', 'Submission', 'Personal', 'Exam'];
const STATUSES = ['all', 'pending', 'completed'];

const CAT_COLORS: Record<string, string> = {
  Study: '#6366f1', Hackathon: '#a855f7', Submission: '#f43f5e',
  Personal: '#10b981', Exam: '#f59e0b', all: '#8b5cf6',
};
const CAT_EMOJIS: Record<string, string> = {
  Study: '📚', Hackathon: '⚡', Submission: '📨',
  Personal: '🌱', Exam: '✏️', all: '✦',
};

function AnimatedNumber({ value }: { value: number | string }) {
  const [display, setDisplay] = useState(0);
  const isNum = typeof value === 'number';

  useEffect(() => {
    if (!isNum) return;
    const end = value as number;
    let current = 0;
    const step = Math.max(1, Math.ceil(end / 20));
    const timer = setInterval(() => {
      current = Math.min(end, current + step);
      setDisplay(current);
      if (current >= end) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [value, isNum]);

  return <>{isNum ? display : value}</>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUserStore();
  const { events, setEvents, filteredEvents, filterCategory, filterStatus, setFilterCategory, setFilterStatus } = useEventStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<DeadlineEvent | null>(null);
  const [cardsVisible, setCardsVisible] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToEvents(user.uid, setEvents);
    return () => unsub();
  }, [user, setEvents]);

  // Stagger card entrance
  useEffect(() => {
    const t = setTimeout(() => setCardsVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (authLoading) return <LoadingScreen />;
  if (!user) return null;

  const displayed = filteredEvents();
  const todayEvents = events.filter((e) => isToday(e) && e.status === 'pending');
  const overdueEvents = events.filter((e) => isOverdue(e));
  const focusEvent = events
    .filter((e) => e.status === 'pending')
    .sort((a, b) => {
      const pOrder = { high: 0, medium: 1, low: 2, auto: 3 };
      const pa = pOrder[getEffectivePriority(a)];
      const pb = pOrder[getEffectivePriority(b)];
      if (pa !== pb) return pa - pb;
      const da = a.deadline instanceof Timestamp ? a.deadline.toDate() : new Date(a.deadline as string);
      const db2 = b.deadline instanceof Timestamp ? b.deadline.toDate() : new Date(b.deadline as string);
      return da.getTime() - db2.getTime();
    })[0];

  const openCreate = () => { setEditEvent(null); setModalOpen(true); };
  const openEdit = (ev: DeadlineEvent) => { setEditEvent(ev); setModalOpen(true); };
  const completionRate = events.length
    ? Math.round((events.filter((e) => e.status === 'completed').length / events.length) * 100)
    : 0;

  const statsData = [
    { label: 'Total', value: events.length, icon: TrendingUp, color: '#6366f1', bg: 'rgba(99,102,241,0.12)', glow: 'rgba(99,102,241,0.2)' },
    { label: 'Today', value: todayEvents.length, icon: Clock, color: '#a855f7', bg: 'rgba(168,85,247,0.12)', glow: 'rgba(168,85,247,0.2)' },
    { label: 'Overdue', value: overdueEvents.length, icon: AlertCircle, color: '#f43f5e', bg: 'rgba(244,63,94,0.12)', glow: 'rgba(244,63,94,0.2)' },
    { label: 'Done', value: `${completionRate}%`, icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.12)', glow: 'rgba(16,185,129,0.2)' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-void)' }}>
      <Navbar onMenuToggle={() => setSidebarOpen((o) => !o)} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onCreateEvent={openCreate} />

        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

          {/* ─── Welcome greeting ─── */}
          <div className="animate-fade-up flex items-center justify-between" style={{ animationDelay: '0ms' }}>
            <div>
              <h1 className="text-xl md:text-2xl font-black" style={{ color: 'var(--text-white)' }}>
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
                <span className="gradient-text">{user?.displayName?.split(' ')[0] ?? 'there'}</span> 👋
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-mid)' }}>
                {overdueEvents.length > 0
                  ? `You have ${overdueEvents.length} overdue deadline${overdueEvents.length > 1 ? 's' : ''} that need attention.`
                  : todayEvents.length > 0
                  ? `${todayEvents.length} deadline${todayEvents.length > 1 ? 's' : ''} due today. Stay focused!`
                  : "You're all caught up! Add new deadlines to stay on track."}
              </p>
            </div>
            <button
              onClick={openCreate}
              className="hidden md:flex magnetic-btn items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}
            >
              <Plus size={16} /> New Deadline
            </button>
          </div>

          {/* ─── Stats Grid ─── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statsData.map(({ label, value, icon: Icon, color, bg, glow }, i) => (
              <div
                key={label}
                className="group relative rounded-2xl p-4 overflow-hidden card-hover animate-fade-up cursor-default"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-dim)',
                  animationDelay: `${(i + 1) * 60}ms`,
                }}
              >
                {/* BG glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${glow}, transparent 70%)` }} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>{label}</span>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                  </div>
                  <p className="text-3xl font-black" style={{ color }}>
                    <AnimatedNumber value={value} />
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ─── Focus Banner ─── */}
          {focusEvent && (
            <div
              className="animate-fade-up relative rounded-2xl p-5 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(79,70,229,0.18), rgba(124,58,237,0.12), rgba(168,85,247,0.08))',
                border: '1px solid rgba(99,102,241,0.3)',
                boxShadow: '0 0 40px rgba(79,70,229,0.08)',
                animationDelay: '300ms',
              }}
            >
              {/* Subtle orb */}
              <div className="absolute right-0 top-0 w-40 h-40 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(168,85,247,0.12), transparent 70%)',
                  filter: 'blur(20px)',
                }} />
              <div className="relative flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse-glow"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                  <Flame size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={13} style={{ color: '#a78bfa' }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#a5b4fc' }}>Focus Now</span>
                  </div>
                  <h3 className="text-lg font-black truncate" style={{ color: 'var(--text-white)' }}>{focusEvent.title}</h3>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-mid)' }}>
                    {focusEvent.category} · {getEffectivePriority(focusEvent)} priority · due soon
                  </p>
                </div>
                <button
                  onClick={() => openEdit(focusEvent)}
                  className="magnetic-btn flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold text-white"
                  style={{ background: 'rgba(124,58,237,0.4)', border: '1px solid rgba(168,85,247,0.3)' }}
                >
                  View →
                </button>
              </div>
            </div>
          )}

          {/* ─── Overdue ─── */}
          {overdueEvents.length > 0 && (
            <Section title="🚨 Overdue" count={overdueEvents.length} accentColor="#f43f5e" delay={350}>
              {overdueEvents.map((e, i) => (
                <EventCard key={e.id} event={e} onEdit={openEdit}
                  style={{ animationDelay: `${i * 50}ms`, opacity: cardsVisible ? 1 : 0 }} />
              ))}
            </Section>
          )}

          {/* ─── Today ─── */}
          {todayEvents.length > 0 && (
            <Section title="📅 Due Today" count={todayEvents.length} accentColor="#6366f1" delay={400}>
              {todayEvents.map((e, i) => (
                <EventCard key={e.id} event={e} onEdit={openEdit}
                  style={{ animationDelay: `${i * 50}ms`, opacity: cardsVisible ? 1 : 0 }} />
              ))}
            </Section>
          )}

          {/* ─── Filters ─── */}
          <div className="animate-fade-up space-y-3" style={{ animationDelay: '460ms' }}>
            <div className="flex items-center gap-2">
              <Filter size={13} style={{ color: 'var(--text-faint)' }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>Filter</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const active = filterCategory === cat;
                return (
                  <button key={cat} onClick={() => setFilterCategory(cat)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      background: active ? CAT_COLORS[cat] ?? '#8b5cf6' : 'var(--bg-elevated)',
                      color: active ? '#fff' : 'var(--text-mid)',
                      border: `1px solid ${active ? 'transparent' : 'var(--border-dim)'}`,
                      boxShadow: active ? `0 0 12px rgba(${cat === 'all' ? '139,92,246' : '0,0,0'},0.2)` : 'none',
                    }}>
                    {CAT_EMOJIS[cat] && <span className="text-[10px]">{CAT_EMOJIS[cat]}</span>}
                    {cat}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              {STATUSES.map((s) => {
                const active = filterStatus === s;
                return (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      background: active ? 'rgba(168,85,247,0.8)' : 'var(--bg-elevated)',
                      color: active ? '#fff' : 'var(--text-mid)',
                      border: `1px solid ${active ? 'rgba(168,85,247,0.5)' : 'var(--border-dim)'}`,
                    }}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── All Events ─── */}
          <Section title="All Deadlines" count={displayed.length} accentColor="#a855f7" delay={520}>
            {displayed.length === 0 ? (
              <EmptyState onCreate={openCreate} />
            ) : (
              displayed.map((e, i) => (
                <EventCard key={e.id} event={e} onEdit={openEdit}
                  style={{ animationDelay: `${i * 40}ms`, opacity: cardsVisible ? 1 : 0 }} />
              ))
            )}
          </Section>
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

function Section({
  title, count, accentColor, children, delay = 0,
}: {
  title: string; count: number; accentColor: string; children: React.ReactNode; delay?: number;
}) {
  return (
    <section className="animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-2.5 mb-4">
        <h2 className="text-sm font-bold" style={{ color: 'var(--text-bright)' }}>{title}</h2>
        <span className="px-2 py-0.5 rounded-full text-xs font-black"
          style={{ background: `${accentColor}18`, color: accentColor }}>
          {count}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{children}</div>
    </section>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 rounded-2xl text-center relative overflow-hidden"
      style={{ border: '2px dashed var(--border-dim)' }}>
      {/* Ambient pulse */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.04), transparent 60%)' }} />
      <div className="relative">
        <div className="text-6xl mb-4 animate-float">🎯</div>
        <p className="text-base font-bold mb-1" style={{ color: 'var(--text-bright)' }}>No deadlines here</p>
        <p className="text-sm mb-6" style={{ color: 'var(--text-mid)' }}>Add one to get started and never miss a deadline</p>
        <button
          onClick={onCreate}
          className="magnetic-btn inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}
        >
          <Plus size={16} /> Add First Deadline
        </button>
      </div>
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
        <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Loading your workspace...</p>
      </div>
      {/* Wave bars */}
      <div className="flex items-end gap-1 h-8">
        {[0,1,2,3,4].map((i) => (
          <div key={i} className="w-1 rounded-full"
            style={{
              background: 'var(--violet)',
              animation: `wave 1s ease-in-out ${i * 0.12}s infinite`,
              height: '100%',
            }} />
        ))}
      </div>
    </div>
  );
}
