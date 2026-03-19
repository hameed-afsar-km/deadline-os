'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useEventStore } from '@/store/useEventStore';
import { isOverdue, isToday } from '@/utils/priority';
import { cn } from '@/utils/cn';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onCreateEvent: () => void;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
];

export function Sidebar({ open, onClose, onCreateEvent }: SidebarProps) {
  const pathname = usePathname();
  const events = useEventStore((s) => s.events);

  const todayCount = events.filter((e) => isToday(e) && e.status === 'pending').length;
  const overdueCount = events.filter((e) => isOverdue(e)).length;
  const pendingCount = events.filter((e) => e.status === 'pending').length;
  const completedCount = events.filter((e) => e.status === 'completed').length;
  const completionPct = events.length ? Math.round((completedCount / events.length) * 100) : 0;

  const stats = [
    { label: 'Today', count: todayCount, icon: Clock, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    { label: 'Overdue', count: overdueCount, icon: AlertTriangle, color: '#f43f5e', bg: 'rgba(244,63,94,0.12)' },
    { label: 'Pending', count: pendingCount, icon: TrendingUp, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Done', count: completedCount, icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          'fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 flex flex-col w-64',
          'md:translate-x-0 md:static md:z-auto',
          'transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          background: 'var(--bg-deep)',
          borderRight: '1px solid var(--border-dim)',
        }}
      >
        {/* Mobile close */}
        <div className="flex items-center justify-between p-4 md:hidden">
          <span className="font-bold text-sm gradient-text">Menu</span>
          <button onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/5 transition-colors active:scale-90">
            <X size={16} style={{ color: 'var(--text-mid)' }} />
          </button>
        </div>

        {/* Create button */}
        <div className="p-4">
          <button
            onClick={() => { onCreateEvent(); onClose(); }}
            className="group relative w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm text-white overflow-hidden transition-all duration-200 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7)' }}
            id="create-event-btn"
          >
            {/* Shimmer sweep on hover */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                transform: 'translateX(-100%)',
                transition: 'none',
              }} />
            <div className="absolute inset-0 group-hover:[--x:translateX(200%)] [--x:translateX(-100%)] transition-transform duration-700"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
              }} />
            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>New Deadline</span>
          </button>
        </div>

        {/* Nav links */}
        <nav className="px-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  active ? 'text-white' : 'hover:bg-white/5'
                )}
                style={
                  active
                    ? {
                        background: 'linear-gradient(135deg, rgba(79,70,229,0.25), rgba(124,58,237,0.15))',
                        color: '#a5b4fc',
                        boxShadow: 'inset 0 0 0 1px rgba(99,102,241,0.25)',
                      }
                    : { color: 'var(--text-mid)' }
                }
              >
                <span className={cn('p-1.5 rounded-lg transition-all duration-200', active ? '' : 'group-hover:bg-white/8')}
                  style={{ background: active ? 'rgba(99,102,241,0.2)' : 'transparent' }}>
                  <Icon size={15} style={{ color: active ? '#818cf8' : 'var(--text-mid)' }} />
                </span>
                {label}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 my-4 h-px" style={{ background: 'var(--border-dim)' }} />

        {/* Stats */}
        <div className="px-4">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-faint)' }}>
            Overview
          </p>
          <div className="grid grid-cols-2 gap-2">
            {stats.map(({ label, count, icon: Icon, color, bg }, i) => (
              <div
                key={label}
                className="rounded-xl p-3 transition-all duration-200 hover:scale-[1.03] cursor-default"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-dim)',
                  animationDelay: `${i * 60}ms`,
                }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2" style={{ background: bg }}>
                  <Icon size={13} style={{ color }} />
                </div>
                <p className="text-xl font-black" style={{ color }}>{count}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-faint)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4 mt-4">
          <div className="rounded-2xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-mid)' }}>
                <Sparkles size={11} style={{ color: '#a78bfa' }} />
                Completion
              </span>
              <span className="text-xs font-bold gradient-text">{completionPct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${completionPct}%`,
                  background: 'linear-gradient(90deg, #4f46e5, #a855f7)',
                  boxShadow: '0 0 8px rgba(139,92,246,0.5)',
                }}
              />
            </div>
            <p className="text-[10px] mt-2" style={{ color: 'var(--text-faint)' }}>
              {completedCount} of {events.length} deadlines complete
            </p>
          </div>
        </div>

        {/* Tip */}
        <div className="mt-auto p-4">
          <div className="rounded-2xl p-3.5 text-xs relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.12), rgba(124,58,237,0.08))', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div className="absolute -right-3 -top-3 text-4xl opacity-10">💡</div>
            <p className="font-semibold mb-1" style={{ color: '#a5b4fc' }}>Focus Mode Tip</p>
            <p style={{ color: 'var(--text-dim)' }}>Tackle your highest-priority deadline first thing each morning.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
