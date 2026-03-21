'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEventStore } from '@/store/useEventStore';
import { LayoutGrid, Calendar, Plus, X, PieChart, Star, TrendingUp } from 'lucide-react';
import { cn } from '@/utils/cn';
import { isOverdue, isToday } from '@/utils/priority';
import { motion, AnimatePresence } from 'framer-motion';
import { GlowingShadow } from '@/components/ui/glowing-shadow';

interface SidebarProps {
  open?: boolean;
  onClose: () => void;
  onCreateEvent: () => void;
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Primary Inbox', icon: LayoutGrid },
  { href: '/calendar',  label: 'Timeline View',  icon: Calendar },
];

export function Sidebar({ open, onClose, onCreateEvent }: SidebarProps) {
  const pathname = usePathname();
  const { events } = useEventStore();

  const totalN   = events.length;
  const doneN    = events.filter(e => e.status === 'completed').length;
  const overdueN = events.filter(e => isOverdue(e)).length;
  const todayN   = events.filter(e => isToday(e) && e.status === 'pending').length;
  const pct      = totalN ? Math.round((doneN / totalN) * 100) : 0;

  return (
    <>
      <AnimatePresence>
        {open && (
           <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 md:hidden bg-black/60 backdrop-blur-md"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        'fixed md:static left-0 h-full md:h-auto z-40 w-[280px] flex flex-col',
        'glass-hi border-r border-white/5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}>

        <div className="flex items-center justify-between px-6 py-6 border-b border-white/[0.05] md:hidden">
          <span className="font-black text-xl text-white tracking-tighter">DeadlineOS</span>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white"><X size={24} /></button>
        </div>

        <div className="p-6 border-b border-white/[0.05]">
          <GlowingShadow onClick={() => { onCreateEvent(); onClose(); }}>
            <div className="flex items-center gap-2.5 text-sm font-bold">
              <Plus size={20} /> Create Task
            </div>
          </GlowingShadow>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto no-sb">
          <p className="px-3 mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Navigation</p>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} onClick={onClose}>
                <motion.div whileHover={{ x: 2 }} 
                  className={cn(
                    'flex items-center gap-4 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all relative group',
                    active
                      ? 'bg-indigo-500/10 text-white border border-indigo-500/10'
                      : 'text-zinc-500 hover:text-white hover:bg-white/[0.04]'
                  )}>
                  {active && <motion.div layoutId="sidebar-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.5)]" />}
                  <Icon size={18} className={cn('transition-colors', active ? 'text-indigo-400' : 'group-hover:text-indigo-500')} />
                  {label}
                </motion.div>
              </Link>
            );
          })}

          <div className="mt-12 space-y-6 pt-6 border-t border-white/[0.05]">
            <p className="px-3 mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Insights Summary</p>

            {[
              { label: 'Upcoming Today',  val: todayN,   color: '#6366F1' },
              { label: 'Attention Needed', val: overdueN, color: '#F43F5E' },
              { label: 'Completed Rate',   val: `${pct}%`, color: '#10B981' },
            ].map(({ label, val, color }) => (
              <div key={label} className="px-3 py-2 transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                    {label}
                  </span>
                  <span className="text-xs font-bold text-white tabular-nums">{val}</span>
                </div>
              </div>
            ))}

            <div className="px-3 pt-4 relative group">
              <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="h-full rounded-full grad-accent shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
                <span>Total Workflow</span>
                <span className="text-zinc-400">{doneN} / {totalN} Tasks</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="p-6 border-t border-white/[0.05] bg-neutral-900/10">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl glass-hi border border-white/[0.05] shadow-inner">
             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,187,129,0.5)]" />
             <div className="flex flex-col">
               <span className="text-[10px] font-bold text-white uppercase tracking-widest">Workspace Online</span>
               <span className="text-[9px] text-zinc-500 font-medium">Real-time sync active</span>
             </div>
          </div>
        </div>
      </aside>
    </>
  );
}
