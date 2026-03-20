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
import { Plus, Filter, LayoutGrid, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Dashboard() {
  const { user } = useUserStore();
  const { events, searchQuery } = useEventStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DeadlineEvent|null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filtered = useMemo(() => {
    return events.filter(e => {
      const matchSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = activeFilter === 'all' || e.status === activeFilter;
      return matchSearch && matchFilter;
    });
  }, [events, searchQuery, activeFilter]);

  const stats = useMemo(() => {
    const overdue = events.filter(e => e.status==='pending' && new Date(e.deadline as unknown as string) < new Date()).length;
    const completed = events.filter(e => e.status==='completed').length;
    const pending = events.filter(e => e.status==='pending').length;
    return { overdue, completed, pending };
  }, [events]);

  const priorityOne = useMemo(() => {
    return events.filter(e => e.status === 'pending')
      .sort((a,b) => new Date(a.deadline as unknown as string).getTime() - new Date(b.deadline as unknown as string).getTime())[0];
  }, [events]);

  const openEdit = (e: DeadlineEvent) => { setEditingEvent(e); setIsModalOpen(true); };
  const close = () => { setEditingEvent(null); setIsModalOpen(false); };

  return (
    <div className="flex flex-col min-h-screen text-zinc-100 font-sans selection:bg-cyan-500/30">
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      
      <div className="flex flex-1 relative overflow-hidden">
        <Sidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          onCreateEvent={() => setIsModalOpen(true)}
        />

        <main className="flex-1 p-6 lg:p-10 overflow-y-auto no-sb relative z-10 w-full max-w-[1600px] mx-auto">
          {/* Header Section */}
          <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration: 0.6 }} className="flex flex-col gap-3 mb-10">
            <h1 className="text-4xl lg:text-[3.5rem] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-500">
              Welcome back, {user?.displayName || 'User'}
            </h1>
            <p className="text-zinc-500 font-medium text-lg tracking-wide uppercase">
              Current System Diagnostics
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
            {/* Primary Focus Banner */}
            <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1, duration: 0.7 }}
              className="lg:col-span-3 p-10 rounded-[40px] glass-card overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[80px] -mx-20 -my-20 pointer-events-none transition-all duration-700 group-hover:bg-cyan-500/30" />
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10 w-full h-full">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400 bg-cyan-400/10 px-4 py-2 rounded-xl border border-cyan-400/20">Critical Vector</span>
                  </div>
                  {priorityOne ? (
                    <div className="space-y-4">
                      <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-white leading-tight drop-shadow-lg">
                        {priorityOne.title}
                      </h2>
                      <p className="text-zinc-400 text-lg font-medium max-w-xl line-clamp-2 leading-relaxed">
                        {priorityOne.description || 'Target is approaching critical threshold. Action required.'}
                      </p>
                    </div>
                  ) : (
                    <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-zinc-500 leading-tight">
                      System optimal. No pending targets.
                    </h2>
                  )}
                </div>

                {priorityOne && (
                  <div className="p-8 rounded-[32px] bg-white/[0.03] border border-white/10 shadow-2xl backdrop-blur-md text-center min-w-[240px] flex flex-col items-center justify-center relative overflow-hidden hover:border-cyan-400/30 transition-colors">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">Delta T</p>
                    <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 tracking-tighter drop-shadow-md">
                      {Math.max(0, Math.round((new Date(priorityOne.deadline as unknown as string).getTime() - new Date().getTime()) / 3600000))}h
                    </p>
                    <button
                      onClick={() => openEdit(priorityOne)}
                      className="w-full mt-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-widest font-black transition-all border border-white/10">
                      Engage Target
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Metrics */}
            <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2, duration: 0.6 }} className="flex flex-col gap-6">
              <div className="flex-1 glass-card p-8 rounded-[32px] group hover:border-rose-500/30 transition-colors overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-rose-500/20 transition-all pointer-events-none" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-400">Breaches</span>
                  <span className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20"><Clock size={18} strokeWidth={2.5} /></span>
                </div>
                <p className="text-5xl font-black tracking-tighter text-white drop-shadow-lg relative z-10">{stats.overdue}</p>
                <p className="text-xs font-bold text-zinc-500 mt-2 uppercase tracking-widest relative z-10">Requires attention</p>
              </div>
              <div className="flex-1 glass-card p-8 rounded-[32px] group hover:border-emerald-500/30 transition-colors overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Secured</span>
                  <span className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20"><CheckCircle2 size={18} strokeWidth={2.5} /></span>
                </div>
                <p className="text-5xl font-black tracking-tighter text-white drop-shadow-lg relative z-10">{stats.completed}</p>
                <p className="text-xs font-bold text-zinc-500 mt-2 uppercase tracking-widest relative z-10">Successfully resolved</p>
              </div>
            </motion.div>
          </div>

          {/* Controls Bar */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3, duration: 0.6 }} className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 p-1.5 glass-panel rounded-3xl">
                {['all', 'pending', 'completed'].map((f) => (
                  <button key={f}
                    onClick={() => setActiveFilter(f as 'all' | 'pending' | 'completed')}
                    className={cn("px-6 py-3 text-xs font-black uppercase tracking-widest transition-all rounded-2xl relative",
                      activeFilter === f ? "text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/20" : "text-zinc-500 hover:text-zinc-300"
                    )}>
                    {activeFilter === f && <motion.div layoutId="filter-bg" className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-md" />}
                    <span className="relative z-10">{f}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] flex gap-3 items-center text-xs uppercase tracking-widest font-black transition-all border border-indigo-400/50 hover:scale-105">
              <Plus size={18} strokeWidth={3} /> Inject Node
            </button>
          </motion.div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-24">
            <AnimatePresence mode="popLayout">
              {filtered.map((e) => (
                <EventCard key={e.id} event={e} onEdit={openEdit} />
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }} className="col-span-full flex flex-col items-center justify-center py-40 glass-card rounded-[40px] border-dashed border-white/20">
                <div className="w-24 h-24 rounded-[32px] glass-panel flex items-center justify-center mb-8 text-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                  <LayoutGrid size={32} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">Void Space</h3>
                <p className="text-base font-medium text-zinc-500 text-center max-w-sm">
                  The current matrix contains no anomalies based on these parameters. 
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-8 px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white font-bold shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:bg-white/20 transition-colors uppercase tracking-widest text-xs">
                  Inject Primary Target
                </button>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {isModalOpen && <EventModal event={editingEvent} onClose={close} />}
      </AnimatePresence>
    </div>
  );
}
