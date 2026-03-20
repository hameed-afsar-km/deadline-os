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
import { Activity, Plus, Filter, LayoutGrid, Search, AlertCircle, Zap } from 'lucide-react';

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
    const overdue = events.filter(e => e.status==='pending' && new Date(e.deadline as any) < new Date()).length;
    const completed = events.filter(e => e.status==='completed').length;
    const pending = events.filter(e => e.status==='pending').length;
    return { overdue, completed, pending };
  }, [events]);

  const priorityOne = useMemo(() => {
    return events.filter(e => e.status === 'pending')
      .sort((a,b) => new Date(a.deadline as any).getTime() - new Date(b.deadline as any).getTime())[0];
  }, [events]);

  const openEdit = (e: DeadlineEvent) => { setEditingEvent(e); setIsModalOpen(true); };
  const close = () => { setEditingEvent(null); setIsModalOpen(false); };

  return (
    <div className="flex flex-col min-h-screen bg-[#020617] text-white">
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      
      <div className="flex flex-1 relative overflow-hidden">
        <Sidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          onCreateEvent={() => setIsModalOpen(true)}
        />

        <main className="flex-1 p-6 lg:p-12 overflow-y-auto no-sb relative z-10">
          {/* Header Section */}
          <div className="flex flex-col gap-2 mb-12">
            <h1 className="text-4xl lg:text-7xl font-black tracking-tighter leading-none" style={{ fontFamily: 'var(--font-heading)' }}>
              SYSTEM_READY, <span className="text-violet-500">{user?.displayName?.toUpperCase() || 'USER'}</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.4em] flex items-center gap-2 text-[10px]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              NODE_ID: {user?.uid.slice(0, 12)} // STATUS: OPTIMIZED
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
            {/* Critical Focus Indicator */}
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              className="lg:col-span-3 cyber-panel p-8 glass-card border-violet-500/20 shadow-[0_20px_60px_-15px_rgba(139,92,246,0.15)] group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 opacity-5 bg-violet-500 blur-3xl pointer-events-none group-hover:opacity-10 transition-all" />
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Zap size={18} className="text-violet-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400">APEX_PRIORITY_NODE</span>
                  </div>
                  {priorityOne ? (
                    <div className="space-y-3">
                      <h2 className="text-4xl lg:text-6xl font-black tracking-tighter max-w-xl leading-none">
                        CRITICAL: &ldquo;{priorityOne.title}&rdquo;
                      </h2>
                      <p className="text-slate-400 text-lg font-medium max-w-md">Immediate attention required by the command chain. Execution window closing soon.</p>
                    </div>
                  ) : (
                    <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-700 leading-none">All clusters operational. No priority nodes.</h2>
                  )}
                </div>

                {priorityOne && (
                  <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.04] text-center min-w-[240px]">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">TIME_WINDOW</p>
                    <p className="text-4xl font-black text-rose-500 tracking-tighter">
                      -{Math.max(0, Math.round((new Date(priorityOne.deadline as any).getTime() - new Date().getTime()) / 3600000))}HRS
                    </p>
                    <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                      onClick={() => openEdit(priorityOne)}
                      className="w-full mt-6 py-3 rounded-xl bg-violet-600 text-[10px] font-black tracking-widest uppercase text-white shadow-xl hover:bg-violet-500 transition-all">
                      INITIALIZE_REDO
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Metrics */}
            <div className="flex flex-col gap-6">
              <div className="flex-1 cyber-panel p-6 glass-card bg-orange-500/5 border-orange-500/20">
                <div className="flex items-center justify-between mb-4">
                  <AlertCircle className="text-orange-500" size={18} />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-400">STATUS: HEAT</span>
                </div>
                <p className="text-4xl font-black tracking-tighter mb-1 text-orange-500">{stats.overdue}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">LATENCY_WARNING</p>
              </div>
              <div className="flex-1 cyber-panel p-6 glass-card bg-emerald-500/5 border-emerald-500/20">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle2 className="text-emerald-500" size={18} />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">STATUS: SYNK</span>
                </div>
                <p className="text-4xl font-black tracking-tighter mb-1 text-emerald-500">{stats.completed}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">NODES_FINALIZED</p>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="sticky top-24 z-20 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 py-3 backdrop-blur-3xl border-y border-white/5 bg-slate-900/10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-6 py-2 rounded-xl bg-white/5 border border-white/10">
                <Filter size={14} className="text-violet-500" />
                <span className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">FILTERS:</span>
              </div>
              <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl">
                {['all', 'pending', 'completed'].map((f) => (
                  <button key={f}
                    onClick={() => setActiveFilter(f as any)}
                    className={cn(
                      "px-5 py-2 text-[10px] font-black tracking-widest uppercase transition-all rounded-xl",
                      activeFilter === f ? "bg-violet-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                    )}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white shadow-xl shadow-violet-600/20 flex gap-3 items-center text-xs font-black uppercase tracking-[0.2em]">
              <Plus size={18} strokeWidth={3} />
              NEW_NODE_ENTRY
            </motion.button>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((e) => (
                <EventCard key={e.id} event={e} onEdit={openEdit} />
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
              <div className="w-16 h-16 rounded-full border-2 border-slate-800 flex items-center justify-center mb-6">
                <LayoutGrid size={24} className="text-slate-800" />
              </div>
              <p className="text-lg font-black tracking-tight text-slate-700 uppercase italic">Empty Cluster. No signals detected.</p>
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {isModalOpen && <EventModal event={editingEvent} onClose={close} />}
      </AnimatePresence>
    </div>
  );
}
