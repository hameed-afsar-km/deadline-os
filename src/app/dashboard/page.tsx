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
import { Filter, Flame, Loader2, Sparkles, TrendingUp, Clock, AlertCircle, CheckCircle2, Plus } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

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

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToEvents(user.uid, setEvents);
    return () => unsub();
  }, [user, setEvents]);

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
      const db = b.deadline instanceof Timestamp ? b.deadline.toDate() : new Date(b.deadline as string);
      return da.getTime() - db.getTime();
    })[0];

  const openCreate = () => { setEditEvent(null); setModalOpen(true); };
  const openEdit = (ev: DeadlineEvent) => { setEditEvent(ev); setModalOpen(true); };
  
  const completionRate = events.length
    ? Math.round((events.filter((e) => e.status === 'completed').length / events.length) * 100)
    : 0;

  const statsData = [
    { label: 'Total', value: events.length, icon: TrendingUp, color: '#6366f1' },
    { label: 'Today', value: todayEvents.length, icon: Clock, color: '#a855f7' },
    { label: 'Overdue', value: overdueEvents.length, icon: AlertCircle, color: '#f43f5e' },
    { label: 'Done', value: `${completionRate}%`, icon: CheckCircle2, color: '#10b981' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-purple-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/5 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <Navbar onMenuToggle={() => setSidebarOpen((o) => !o)} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onCreateEvent={openCreate} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">

          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-black">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  {user?.displayName?.split(' ')[0] ?? 'there'}
                </span>
              </h1>
              <p className="text-sm font-medium text-gray-400 mt-1">
                {overdueEvents.length > 0
                  ? <span className="text-rose-400">{overdueEvents.length} overdue</span> 
                  : todayEvents.length > 0
                  ? <span className="text-purple-400">{todayEvents.length} due today</span>
                  : "All caught up."}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCreate}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm bg-white text-black shadow-lg shadow-white/10 hover:shadow-white/20 transition-shadow"
            >
              <Plus size={16} /> New Deadline
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {statsData.map(({ label, value, icon: Icon, color }) => (
              <motion.div
                key={label}
                variants={itemVariants}
                whileHover={{ y: -5, boxShadow: `0 10px 30px -10px ${color}40` }}
                className="relative rounded-3xl p-5 bg-white/[0.03] border border-white/[0.05] overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Icon size={48} style={{ color }} />
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                     <Icon size={14} style={{ color }} />
                  </div>
                </div>
                <p className="text-3xl font-black" style={{ color }}>
                  <AnimatedNumber value={value} />
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Focus Banner */}
          <AnimatePresence>
            {focusEvent && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="relative rounded-3xl p-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20 shadow-[0_0_40px_-10px_rgba(168,85,247,0.2)] overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-6"
              >
                <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/20 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex flex-shrink-0 items-center justify-center shadow-lg shadow-purple-500/30">
                  <Flame size={20} className="text-white" />
                </div>

                <div className="flex-1 relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={14} className="text-purple-400" />
                    <span className="text-xs font-bold tracking-widest uppercase text-purple-300">Focus Target</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1 truncate pr-4">{focusEvent.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                     <span className="px-2 py-0.5 rounded bg-white/10 text-xs font-semibold">{focusEvent.category}</span>
                     <span>·</span>
                     <span className="text-xs font-semibold uppercase tracking-wider">{getEffectivePriority(focusEvent)} PRIORITY</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openEdit(focusEvent)}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl text-sm font-bold bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md transition-colors relative z-10"
                >
                  Action →
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4 bg-white/[0.02] p-4 rounded-3xl border border-white/[0.05]"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-2 text-gray-500">
                <Filter size={14} />
                <span className="text-xs font-bold uppercase tracking-widest">Filter</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const active = filterCategory === cat;
                  return (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      key={cat} onClick={() => setFilterCategory(cat)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                        active ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.1]'
                      }`}
                    >
                      {CAT_EMOJIS[cat] && <span className="text-sm">{CAT_EMOJIS[cat]}</span>}
                      {cat}
                    </motion.button>
                  );
                })}
              </div>

              <div className="h-4 w-px bg-white/10 hidden lg:block" />

              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => {
                  const active = filterStatus === s;
                  return (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      key={s} onClick={() => setFilterStatus(s)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                        active ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.1]'
                      }`}
                    >
                      {s}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Event Grids */}
          <div className="space-y-12 pb-12">
            <AnimatePresence>
              {overdueEvents.length > 0 && (
                <Section title="Overdue Action Required" count={overdueEvents.length} accentColor="#f43f5e">
                  {overdueEvents.map((e) => (
                    <EventCard key={e.id} event={e} onEdit={openEdit} />
                  ))}
                </Section>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {todayEvents.length > 0 && (
                <Section title="Due Today" count={todayEvents.length} accentColor="#a855f7">
                  {todayEvents.map((e) => (
                    <EventCard key={e.id} event={e} onEdit={openEdit} />
                  ))}
                </Section>
              )}
            </AnimatePresence>

            <Section title="All Deadlines" count={displayed.length} accentColor="#6366f1">
              <AnimatePresence mode="popLayout">
                {displayed.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="col-span-full py-24 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center bg-white/[0.02]"
                  >
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-xl font-bold mb-2">No deadlines found</h3>
                    <p className="text-gray-400 mb-8">Ready to crush your next objective?</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={openCreate}
                      className="px-8 py-4 bg-white text-black rounded-2xl font-bold flex items-center gap-2"
                    >
                      <Plus size={20} /> Create Objective
                    </motion.button>
                  </motion.div>
                ) : (
                  displayed.map((e) => (
                    <EventCard key={e.id} event={e} onEdit={openEdit} />
                  ))
                )}
              </AnimatePresence>
            </Section>
          </div>

        </main>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <EventModal
            event={editEvent}
            onClose={() => { setModalOpen(false); setEditEvent(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({
  title, count, accentColor, children,
}: {
  title: string; count: number; accentColor: string; children: React.ReactNode;
}) {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <h2 className="text-2xl font-black">{title}</h2>
        <span className="px-3 py-1 rounded-full text-sm font-bold shadow-[0_0_15px_currentColor]"
          style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
          {count}
        </span>
      </div>
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {children}
      </motion.div>
    </motion.section>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-6 bg-[#050505]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="relative w-20 h-20"
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 blur-xl opacity-50" />
        <div className="absolute inset-2 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
           <span className="font-black text-white text-2xl">D</span>
        </div>
      </motion.div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Loading Workspace</h2>
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-purple-500"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
