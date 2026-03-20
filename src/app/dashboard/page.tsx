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
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      
      <div className="flex flex-1 relative overflow-hidden">
        <Sidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          onCreateEvent={() => setIsModalOpen(true)}
        />

        <main className="flex-1 p-6 lg:p-10 overflow-y-auto no-sb relative z-10 w-full max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col gap-2 mb-10">
            <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
              Welcome back, {user?.displayName || 'User'}
            </h1>
            <p className="text-slate-500 font-medium text-15">
              Here's what's happening with your projects today.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
            {/* Primary Focus Banner */}
            <div className="lg:col-span-3 bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm relative overflow-hidden transition-shadow hover:shadow-md">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mx-20 -my-20 pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10 w-full h-full">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)] animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Top Priority</span>
                  </div>
                  {priorityOne ? (
                    <div className="space-y-2">
                      <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                        {priorityOne.title}
                      </h2>
                      <p className="text-slate-500 text-base font-medium max-w-md line-clamp-2">
                        {priorityOne.description || 'Action required before the deadline window closes.'}
                      </p>
                    </div>
                  ) : (
                    <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-400 leading-tight">
                      You're all caught up. No pending deadlines.
                    </h2>
                  )}
                </div>

                {priorityOne && (
                  <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm text-center min-w-[200px] flex flex-col items-center justify-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Time Remaining</p>
                    <p className="text-3xl font-extrabold text-blue-600 tracking-tight">
                      {Math.max(0, Math.round((new Date(priorityOne.deadline as unknown as string).getTime() - new Date().getTime()) / 3600000))} hrs
                    </p>
                    <button
                      onClick={() => openEdit(priorityOne)}
                      className="w-full mt-5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold transition-colors">
                      View Details
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-col gap-6">
              <div className="flex-1 bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2 bg-red-50 text-red-600 rounded-lg"><Clock size={16} strokeWidth={2.5} /></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-red-600">Overdue</span>
                </div>
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">{stats.overdue}</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Requires attention</p>
              </div>
              <div className="flex-1 bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 size={16} strokeWidth={2.5} /></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Completed</span>
                </div>
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">{stats.completed}</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Successfully resolved</p>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-1 bg-slate-200/50 rounded-xl">
                {['all', 'pending', 'completed'].map((f) => (
                  <button key={f}
                    onClick={() => setActiveFilter(f as 'all' | 'pending' | 'completed')}
                    className={`px-4 py-2 text-sm font-semibold capitalize transition-all rounded-lg ${
                      activeFilter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10 flex gap-2 items-center text-sm font-semibold transition-all">
              <Plus size={16} strokeWidth={2.5} /> New Task
            </button>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
            <AnimatePresence mode="popLayout">
              {filtered.map((e) => (
                <EventCard key={e.id} event={e} onEdit={openEdit} />
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-6 text-slate-400">
                  <LayoutGrid size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No deadlines found</h3>
                <p className="text-sm font-medium text-slate-500 text-center max-w-sm">
                  There are no tasks matching your current filters. Add a new deadline to get started.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold shadow-sm hover:bg-slate-50 transition-colors">
                  Create First Task &gt;
                </button>
              </div>
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
