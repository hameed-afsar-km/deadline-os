'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Plus, CheckCircle2, Clock, AlertTriangle, TrendingUp, Flame, X } from 'lucide-react';
import { useEventStore } from '@/store/useEventStore';
import { isOverdue, isToday } from '@/utils/priority';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps { open: boolean; onClose: () => void; onCreateEvent: () => void; }

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calendar',  label: 'Calendar',  icon: Calendar },
];

const containerV = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const itemV = {
  hidden: { opacity: 0, x: -12 },
  show:   { opacity: 1, x: 0, transition: { ease: [0.22, 1, 0.36, 1] as any, duration: 0.4 } },
};

export function Sidebar({ open, onClose, onCreateEvent }: SidebarProps) {
  const pathname = usePathname();
  const events   = useEventStore(s => s.events);

  const todayN    = events.filter(e => isToday(e) && e.status === 'pending').length;
  const overdueN  = events.filter(e => isOverdue(e)).length;
  const pendingN  = events.filter(e => e.status === 'pending').length;
  const doneN     = events.filter(e => e.status === 'completed').length;
  const pct       = events.length ? Math.round((doneN / events.length) * 100) : 0;

  const STATS = [
    { label: 'Today',   n: todayN,   icon: Clock,         c: 'var(--cyan)',    bg: 'rgba(103,232,249,0.08)',   b: 'rgba(103,232,249,0.15)' },
    { label: 'Overdue', n: overdueN, icon: AlertTriangle, c: 'var(--rose)',    bg: 'rgba(251,113,133,0.08)',   b: 'rgba(251,113,133,0.15)' },
    { label: 'Pending', n: pendingN, icon: TrendingUp,    c: 'var(--amber)',   bg: 'rgba(245,158,11,0.08)',    b: 'rgba(245,158,11,0.15)'  },
    { label: 'Done',    n: doneN,    icon: CheckCircle2,  c: 'var(--emerald)', bg: 'rgba(52,211,153,0.08)',    b: 'rgba(52,211,153,0.15)'  },
  ];

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(12,10,9,0.7)', backdropFilter: 'blur(4px)' }}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 flex flex-col w-72 border-r overflow-hidden',
          'md:translate-x-0 md:static md:z-auto transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ borderColor: 'var(--b1)', background: 'rgba(12,10,9,0.95)', backdropFilter: 'blur(20px)' }}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between px-5 py-4 border-b md:hidden" style={{ borderColor: 'var(--b1)' }}>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--t3)' }}>Menu</span>
          <motion.button whileTap={{ scale: 0.85 }} onClick={onClose} style={{ color: 'var(--t2)' }}>
            <X size={16} />
          </motion.button>
        </div>

        {/* Create button */}
        <div className="p-4">
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(245,158,11,0.3)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => { onCreateEvent(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #B45309)', color: '#0C0A09' }}
          >
            <Plus size={16} /> New Deadline
          </motion.button>
        </div>

        {/* Nav */}
        <nav className="px-3 py-2 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} onClick={onClose}>
                <motion.div
                  whileHover={{ x: 3 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={
                    active
                      ? { background: 'rgba(245,158,11,0.1)', color: 'var(--amber)', borderLeft: '2px solid var(--amber)', paddingLeft: '14px' }
                      : { color: 'var(--t2)' }
                  }
                >
                  <Icon size={16} />
                  {label}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="mx-4 my-3 h-px" style={{ background: 'var(--b1)' }} />

        {/* Stats */}
        <div className="px-4 py-2">
          <p className="text-[10px] font-black uppercase tracking-widest mb-3 px-1" style={{ color: 'var(--t4)' }}>Your snapshot</p>
          <motion.div className="grid grid-cols-2 gap-2.5" variants={containerV} initial="hidden" animate="show">
            {STATS.map(({ label, n, icon: Icon, c, bg, b }) => (
              <motion.div
                key={label}
                variants={itemV}
                whileHover={{ scale: 1.03, borderColor: b }}
                className="rounded-2xl p-3.5 flex flex-col gap-2 cursor-default transition-all"
                style={{ background: bg, border: `1px solid ${b.replace('0.15', '0.08')}` }}
              >
                <Icon size={15} style={{ color: c }} />
                <p className="text-2xl font-extrabold" style={{ color: c }}>{n}</p>
                <p className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--t3)' }}>{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Velocity */}
        <div className="px-4 py-4 mt-2">
          <div className="p-4 rounded-2xl" style={{ background: 'var(--s1)', border: '1px solid var(--b1)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--t2)' }}>
                <Flame size={12} style={{ color: 'var(--amber)' }} /> Momentum
              </span>
              <span className="text-sm font-extrabold amber-text">{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--s3)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #F59E0B, #FCD34D)' }}
              />
            </div>
            <p className="text-[11px] mt-2.5 font-medium" style={{ color: 'var(--t3)' }}>
              {doneN} of {events.length} complete
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
