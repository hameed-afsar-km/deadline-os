'use client';

import { DeadlineEvent, Priority, Status } from '@/types';
import { createEvent, updateEvent } from '@/lib/firestore';
import { useUserStore } from '@/store/useUserStore';
import { X, Loader2, Save, ChevronDown, Check, CalendarIcon, AlignLeft, Tag, Layers, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { toInputDatetimeLocal } from '@/utils/dateHelpers';
import { cn } from '@/utils/cn';
import { GlowingShadow } from '@/components/ui/glowing-shadow';

const SUGGESTED_CATS = [
  'Hackathon',
  'Assignment',
  'Test',
  'Project',
  'Seminar',
  'Application Deadline',
  'Competition',
  'Fee',
  'Meeting',
  'Internship'
];

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
          "w-full flex items-center justify-between text-left h-11 px-3.5 rounded-xl border transition-all duration-200 outline-none",
          open 
            ? "bg-[#0A0A0A] border-white/40 ring-1 ring-white/40" 
            : "bg-white/[0.03] border-white/10 hover:border-white/20"
        )}
      >
        {selected ? (
          <div className="flex items-center gap-2.5">
            {selected.color && <div className="w-2.5 h-2.5 rounded-full" style={{ background: selected.color, boxShadow: `0 0 10px ${selected.color}40` }} />}
            <span className="text-sm font-medium text-white tracking-wide">{selected.label}</span>
          </div>
        ) : (
          <span className="text-zinc-500 text-sm font-semibold">{placeholder || 'Select...'}</span>
        )}
        <ChevronDown size={14} className={cn("text-zinc-500 transition-transform duration-300", open && "rotate-180 text-white")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 top-[calc(100%+8px)] left-0 right-0 p-1 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto no-sb"
          >
            {options.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all relative overflow-hidden group",
                  value === o.value ? "bg-white/10 text-white font-semibold" : "text-zinc-400 hover:bg-white/5 hover:text-white font-medium"
                )}
              >
                {value !== o.value && (
                  <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                )}
                <div className="flex items-center gap-2.5 relative z-10">
                  {o.color && <div className="w-2 h-2 rounded-full" style={{ background: o.color }} />}
                  {o.label}
                </div>
                {value === o.value && <Check size={16} className="text-white relative z-10" />}
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
  const [isCustom, setIsCustom] = useState(() => !options.includes(value) && value !== '');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (isCustom && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCustom]);

  const displayValue = isCustom ? value : (options.includes(value) ? value : 'Select Category');

  return (
    <div className="relative" ref={ref}>
      {isCustom ? (
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            value={value === 'Custom' ? '' : value}
            onChange={e => onChange(e.target.value)}
            placeholder="Type custom category..."
            className="w-full text-sm font-medium text-white h-11 pl-3.5 pr-10 rounded-xl bg-white/[0.03] border border-white/40 focus:bg-[#0A0A0A] focus:border-white focus:ring-1 focus:ring-white transition-all outline-none"
          />
          <button 
            type="button" 
            onClick={() => { setIsCustom(false); onChange(options[0]); }}
            className="absolute right-2 w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button 
          type="button" 
          onClick={() => setOpen(!open)}
          className={cn(
            "w-full flex items-center justify-between text-left h-11 px-3.5 rounded-xl border transition-all duration-200 outline-none",
            open 
              ? "bg-[#0A0A0A] border-white/40 ring-1 ring-white/40" 
              : "bg-white/[0.03] border-white/10 hover:border-white/20"
          )}
        >
          <span className={cn("text-sm font-medium tracking-wide", !options.includes(value) ? "text-zinc-500" : "text-white")}>
            {displayValue}
          </span>
          <ChevronDown size={14} className={cn("text-zinc-500 transition-transform duration-300", open && "rotate-180 text-white")} />
        </button>
      )}
      
      <AnimatePresence>
        {open && !isCustom && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 top-[calc(100%+8px)] left-0 right-0 p-1 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto no-sb"
          >
            {options.map(o => (
              <button
                key={o}
                type="button"
                onClick={() => { onChange(o); setOpen(false); }}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all",
                  value === o ? "bg-white/10 text-white font-semibold" : "text-zinc-300 hover:bg-white/5 hover:text-white font-medium"
                )}
              >
                {o}
              </button>
            ))}
            <div className="h-px bg-white/[0.05] my-1" />
            <button
              type="button"
              onClick={() => { setIsCustom(true); onChange(''); setOpen(false); }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-indigo-400 hover:bg-indigo-500/10 transition-all flex items-center justify-between group"
            >
              Custom Category...
              <Plus size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
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
    category: 'Hackathon',
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
    <div className="fixed inset-0 z-[999] flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Slide-Over Panel */}
      <motion.div
        initial={{ opacity: 0, x: "100%" }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: "100%" }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full md:w-[480px] bg-[#0A0A0A] border-l border-white/10 shadow-[-40px_0_100px_rgba(0,0,0,0.8)] flex flex-col h-full z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-zinc-300">
                <Layers size={18} />
             </div>
             <div>
               <h2 className="text-xl font-semibold text-white tracking-tight">{event ? 'Edit Task' : 'New Task'}</h2>
               <p className="text-[11px] text-zinc-500 font-medium tracking-wide">Configure attributes</p>
             </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="relative overflow-y-auto no-sb flex-1">
          <form id="task-form" onSubmit={submit} className="flex flex-col h-full px-8 py-8 space-y-8">
            
            {/* Title */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                Designation
              </label>
              <input
                type="text" required autoFocus
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Launch Marketing Site"
                className="w-full text-base font-semibold text-white h-12 px-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 focus:bg-[#0A0A0A] focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all outline-none placeholder:text-zinc-600"
              />
            </div>

              {/* Grid for Dropdowns & Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                     <CalendarIcon size={12} /> Deadline
                  </label>
                  <label className="block relative cursor-pointer group">
                    <input
                      type="datetime-local" required
                      value={form.deadline}
                      onChange={e => setForm({ ...form, deadline: e.target.value })}
                      className="w-full text-sm font-medium text-white h-11 px-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 focus:bg-[#0A0A0A] focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all outline-none"
                      style={{ colorScheme: 'dark' }}
                    />
                  </label>
                </div>

                <div className="space-y-2 relative z-[51]">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Tag size={12} /> Category
                  </label>
                  <Combobox value={form.category} onChange={v => setForm({...form, category: v})} options={SUGGESTED_CATS} />
                </div>

                <div className="space-y-2 relative z-50">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Priority</label>
                  <CustomSelect 
                    value={form.priority} 
                    onChange={v => setForm({...form, priority: v as Priority})} 
                    options={PRIORITY_OPTIONS} 
                  />
                </div>

                <div className="space-y-2 relative z-40">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest ml-1">Status</label>
                  <CustomSelect 
                    value={form.status} 
                    onChange={v => setForm({...form, status: v as Status})} 
                    options={STATUS_OPTIONS} 
                  />
                </div>
              </div>

            {/* Description */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <AlignLeft size={12} /> Extended Description
              </label>
              <textarea
                rows={5}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Provide further context or subtasks here..."
                className="w-full text-sm font-medium text-white p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 focus:bg-[#0A0A0A] focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all outline-none placeholder:text-zinc-600 resize-none"
              />
            </div>
          </form>
        </div>

        {/* Footer Sidebar Actions */}
        <div className="p-6 border-t border-white/[0.08] bg-[#0A0A0A] flex flex-col gap-3 shrink-0">
           <button type="submit" onClick={(e) => { e.preventDefault(); submit(e as any); }} disabled={loading}
             className="w-full flex items-center justify-center gap-2 text-sm font-semibold h-12 rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors shadow-sm disabled:opacity-50">
             {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
             {event ? 'Save Data' : 'Add to Workspace'}
           </button>
           <button type="button" onClick={onClose} disabled={loading}
             className="w-full h-12 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
             Cancel
           </button>
        </div>
      </motion.div>
    </div>
  );
}
