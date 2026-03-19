'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Plus, CheckCircle2, Clock, AlertTriangle, X, Sparkles, TrendingUp } from 'lucide-react';
import { useEventStore } from '@/store/useEventStore';
import { isOverdue, isToday } from '@/utils/priority';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onCreateEvent: () => void;
}

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calendar',  label: 'Calendar',  icon: Calendar },
];

export function Sidebar({ open, onClose, onCreateEvent }: SidebarProps) {
  const pathname  = usePathname();
  const events    = useEventStore((s) => s.events);

  const todayC     = events.filter((e) => isToday(e)    && e.status === 'pending').length;
  const overdueC   = events.filter((e) => isOverdue(e)).length;
  const pendingC   = events.filter((e) => e.status === 'pending').length;
  const completedC = events.filter((e) => e.status === 'completed').length;
  const pct        = events.length ? Math.round((completedC / events.length) * 100) : 0;

  const STATS = [
    { label: 'Today',   count: todayC,     icon: Clock,         color: 'var(--accent-2)', bg: 'rgba(26,26,255,0.06)', border: 'rgba(26,26,255,0.25)' },
    { label: 'Overdue', count: overdueC,   icon: AlertTriangle, color: 'var(--accent)',   bg: 'rgba(255,85,51,0.06)', border: 'rgba(255,85,51,0.25)' },
    { label: 'Pending', count: pendingC,   icon: TrendingUp,    color: 'var(--amber)',    bg: 'rgba(245,166,35,0.06)', border: 'rgba(245,166,35,0.25)' },
    { label: 'Done',    count: completedC, icon: CheckCircle2,  color: 'var(--accent-3)', bg: 'rgba(0,200,150,0.06)', border: 'rgba(0,200,150,0.25)' },
  ];

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(13,13,13,0.5)' }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 flex flex-col w-72 border-r-2',
          'md:translate-x-0 md:static md:z-auto',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ borderColor: 'var(--ink)', background: 'var(--paper)' }}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 md:hidden" style={{ borderColor: 'var(--border)' }}>
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--ink-4)' }}>Menu</span>
          <motion.button whileTap={{ scale: 0.88 }} onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--ink-3)' }}>
            <X size={16} />
          </motion.button>
        </div>

        {/* Create button */}
        <div className="p-4 border-b-2" style={{ borderColor: 'var(--border)' }}>
          <motion.button
            whileHover={{ x: -2, y: -2, boxShadow: '4px 4px 0 var(--ink)' }}
            whileTap={{ x: 0, y: 0, boxShadow: 'none' }}
            onClick={() => { onCreateEvent(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white border-2 transition-all"
            style={{ background: 'var(--ink)', borderColor: 'var(--ink)' }}
          >
            <Plus size={16} /> New Deadline
          </motion.button>
        </div>

        {/* Nav */}
        <nav className="p-3 space-y-1 border-b-2" style={{ borderColor: 'var(--border)' }}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} onClick={onClose}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all border-2',
                    active ? 'text-white border-ink' : 'text-ink-3 border-transparent hover:border-ink hover:bg-white'
                  )}
                  style={
                    active
                      ? { background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' }
                      : { color: 'var(--ink-3)', borderColor: 'transparent' }
                  }
                >
                  <Icon size={16} />
                  {label}
                  {active && <div className="ml-auto w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Stats */}
        <div className="p-4 border-b-2" style={{ borderColor: 'var(--border)' }}>
          <p className="text-[10px] font-black uppercase tracking-widest mb-3 px-1" style={{ color: 'var(--ink-4)' }}>Overview</p>
          <div className="grid grid-cols-2 gap-2.5">
            {STATS.map(({ label, count, icon: Icon, color, bg, border }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -3, boxShadow: '3px 3px 0 var(--ink)' }}
                className="rounded-2xl p-3.5 border-2 cursor-default bg-white transition-all"
                style={{ background: bg, border: `2px solid ${border}` }}
              >
                <Icon size={16} style={{ color }} className="mb-2" />
                <p className="font-display font-black text-2xl" style={{ color }}>{count}</p>
                <p className="text-[10px] font-extrabold mt-0.5 uppercase tracking-wider" style={{ color: 'var(--ink-4)' }}>{label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="p-4">
          <div className="rounded-2xl p-4 border-2" style={{ borderColor: 'var(--border)', background: 'var(--white)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--ink-3)' }}>
                <Sparkles size={12} /> Velocity
              </span>
              <span className="font-display font-black text-base" style={{ color: 'var(--accent)' }}>{pct}%</span>
            </div>
            <div className="h-2.5 rounded-full border-2 overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--paper-2)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full"
                style={{ background: 'var(--ink)' }}
              />
            </div>
            <p className="text-[11px] mt-3 font-bold" style={{ color: 'var(--ink-4)' }}>
              {completedC} of {events.length} complete
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
