'use client';

import { DeadlineEvent, Priority, Status } from '@/types';
import { createEvent, updateEvent } from '@/lib/firestore';
import { useUserStore } from '@/store/useUserStore';
import { X, Loader2, Save, ChevronDown, Check, CalendarIcon, AlignLeft, Tag, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { toInputDatetimeLocal } from '@/utils/dateHelpers';
import { cn } from '@/utils/cn';
import { GlowingShadow } from '@/components/ui/glowing-shadow';

const SUGGESTED_CATS = ['Hackathons', 'Assignments', 'Competitions', 'Test', 'Client', 'Custom Work', 'Personal'];

const PRIORITY_OPTIONS = [
  { value: 'auto', label: 'Auto-Select', color: '#818CF8' },
  { value: 'high', label: 'High Priority', color: '#F43F5E' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'low', label: 'Low', color: '#10B981' },
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'In Progress', color: '#F59E0B' },
  { value: 'completed', label: 'Completed', color: '#10B981' },
];

function CustomSelect({ value, onChange, options, placeholder }: { value: string, onChange: (v: string) => void, options: {value: string, label: string, color?: string}[], placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button 
        type="button" 
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between text-left h-12 px-4 rounded-2xl border transition-all duration-300 outline-none",
          open 
            ? "bg-white/[0.04] border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]" 
            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.03] hover:border-white/10"
        )}
      >
        {selected ? (
          <div className="flex items-center gap-2.5">
            {selected.color && <div className="w-2.5 h-2.5 rounded-full" style={{ background: selected.color, boxShadow: `0 0 10px ${selected.color}60` }} />}
            <span className="text-sm font-bold text-white tracking-wide">{selected.label}</span>
          </div>
        ) : (
          <span className="text-zinc-500 text-sm font-semibold">{placeholder || 'Select...'}</span>
        )}
        <ChevronDown size={14} className={cn("text-zinc-500 transition-transform duration-300", open && "rotate-180 text-white")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 top-[calc(100%+8px)] left-0 right-0 p-1.5 glass-hi border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] max-h-60 overflow-y-auto no-sb"
          >
            {options.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-all relative overflow-hidden group",
                  value === o.value ? "bg-white/10 text-white font-bold" : "text-zinc-400 hover:bg-white/5 hover:text-white font-semibold"
                )}
              >
                {value !== o.value && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                )}
                <div className="flex items-center gap-2.5 relative z-10">
                  {o.color && <div className="w-2 h-2 rounded-full" style={{ background: o.color }} />}
                  {o.label}
                </div>
                {value === o.value && <Check size={16} className="text-indigo-400 relative z-10" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Combobox({ value, onChange, options }: { value: string, onChange: (v: string) => void, options: string[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(value.toLowerCase()) && o.toLowerCase() !== value.toLowerCase());

  return (
    <div className="relative" ref={ref}>
      <input
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="e.g. Design, Development..."
        className="w-full text-sm font-bold text-white h-12 px-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.03] hover:border-white/10 focus:bg-white/[0.04] focus:border-indigo-500/50 focus:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all outline-none"
      />
      
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 top-[calc(100%+8px)] left-0 right-0 p-1.5 glass-hi border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] max-h-48 overflow-y-auto no-sb"
          >
            {filtered.map(o => (
              <button
                key={o}
                type="button"
                onClick={() => { onChange(o); setOpen(false); }}
                className="w-full text-left px-3 py-3 rounded-xl text-sm font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
              >
                {o}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function EventModal({ event, onClose }: { event: DeadlineEvent | null; onClose: () => void }) {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    deadline: '',
    category: 'Work',
    priority: 'auto' as Priority,
    status: 'pending' as Status,
  });

  useEffect(() => {
    if (event) {
      setForm({
        title:       event.title,
        description: event.description || '',
        deadline:    toInputDatetimeLocal(event.deadline),
        category:    event.category,
        priority:    event.priority,
        status:      event.status,
      });
    } else {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      setForm(f => ({ ...f, deadline: toInputDatetimeLocal(d.toISOString()) }));
    }
  }, [event]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('Not authenticated');
    if (!form.title.trim() || !form.category.trim() || !form.deadline) return toast.error('Please fill required fields');

    setLoading(true);
    try {
      const data = {
        title:       form.title,
        description: form.description,
        deadline:    form.deadline,
        category:    form.category,
        priority:    form.priority,
        status:      form.status,
        reminders:   [] as string[],
      };
      if (event) {
        await updateEvent(event.id, data);
        toast.success('Objective updated');
      } else {
        await createEvent(user.uid, data);
        toast.success('Objective initialized');
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save parameters');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[8px]"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.35 }}
        className="relative w-full max-w-[600px] glass-hi border border-white/10 rounded-[32px] shadow-[0_64px_128px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-full"
      >
        {/* Glow Effects inside modal */}
        <div className="absolute top-0 left-0 w-[120%] h-[120%] pointer-events-none opacity-[0.15]">
           <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-indigo-500 rounded-full blur-[100px]" />
           <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-violet-600 rounded-full blur-[100px]" />
        </div>

        {/* Header */}
        <div className="relative flex items-center justify-between px-8 py-6 border-b border-white/[0.05] bg-white/[0.01]">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Layers size={24} />
             </div>
             <div>
               <h2 className="text-2xl font-black text-white tracking-tighter drop-shadow-lg">{event ? 'Modify Parameters' : 'Initialize Objective'}</h2>
               <p className="text-[11px] text-zinc-400 font-black uppercase tracking-[0.2em] mt-1 drop-shadow-md">Data Configuration Panel</p>
             </div>
          </div>
          <button type="button" onClick={onClose} className="w-10 h-10 rounded-2xl glass border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-all hover:bg-white/10 active:scale-95 shadow-inner">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Modal Body With Form Content */}
        <div className="relative overflow-y-auto no-sb" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <form id="task-form" onSubmit={submit} className="flex flex-col h-full">
            <div className="p-8 space-y-8 flex-1">
              
              {/* Title */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                  Task Designation
                </label>
                <input
                  type="text" required autoFocus
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Architect Core Systems..."
                  className="w-full text-lg font-black text-white h-14 px-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.04] focus:bg-white/[0.06] focus:border-indigo-500/50 focus:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all outline-none placeholder:text-zinc-600"
                />
              </div>

              {/* Grid for Dropdowns & Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                     <CalendarIcon size={12} /> Deadline
                  </label>
                  <label className="block relative cursor-pointer group">
                    <input
                      type="datetime-local" required
                      value={form.deadline}
                      onChange={e => setForm({ ...form, deadline: e.target.value })}
                      className="w-full text-sm font-bold text-white h-12 px-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.03] focus:bg-white/[0.05] focus:border-indigo-500/50 focus:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all outline-none"
                      style={{ colorScheme: 'dark' }}
                    />
                  </label>
                </div>

                <div className="space-y-3 relative z-[51]">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                    <Tag size={12} /> Category
                  </label>
                  <Combobox value={form.category} onChange={v => setForm({...form, category: v})} options={SUGGESTED_CATS} />
                </div>

                <div className="space-y-3 relative z-50">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">Priority Level</label>
                  <CustomSelect 
                    value={form.priority} 
                    onChange={v => setForm({...form, priority: v as Priority})} 
                    options={PRIORITY_OPTIONS} 
                  />
                </div>

                <div className="space-y-3 relative z-40">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">Execution Status</label>
                  <CustomSelect 
                    value={form.status} 
                    onChange={v => setForm({...form, status: v as Status})} 
                    options={STATUS_OPTIONS} 
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                  <AlignLeft size={12} /> Extended Details
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Include sub-tasks, context, or constraints..."
                  className="w-full text-sm font-medium text-white p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.03] focus:bg-white/[0.05] focus:border-indigo-500/50 focus:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all outline-none placeholder:text-zinc-600 resize-none"
                />
              </div>
            </div>

            {/* Footer actions inside form */}
            <div className="relative p-6 px-8 border-t border-white/[0.05] bg-white/[0.02] flex items-center justify-end gap-4 shrink-0">
               <button type="button" onClick={onClose} disabled={loading}
                 className="px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors active:scale-95">
                 Abort
               </button>
               <GlowingShadow type="submit" disabled={loading}>
                 <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-1">
                   {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                   {event ? 'Sync Payload' : 'Deploy Task'}
                 </div>
               </GlowingShadow>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
