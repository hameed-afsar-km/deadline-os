'use client';

import { useEffect, useState } from 'react';
import { DeadlineEvent, Category, Priority } from '@/types';
import { createEvent, updateEvent } from '@/lib/firestore';
import { useUserStore } from '@/store/useUserStore';
import { defaultReminders } from '@/utils/priority';
import { toInputDatetimeLocal } from '@/utils/dateHelpers';
import { Timestamp } from 'firebase/firestore';
import { X, Plus, Trash2, Calendar, BellRing, Zap, AlignLeft, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

type FormData = {
  title: string;
  description: string;
  category: Category;
  deadline: string;
  priority: Priority;
  reminders: string[];
};

interface EventModalProps {
  event?: DeadlineEvent | null;
  onClose: () => void;
}

const CATEGORIES: { value: Category; emoji: string; color: string; bg: string }[] = [
  { value: 'Study',      emoji: '📚', color: '#6366f1', bg: 'rgba(99,102,241,0.15)'  },
  { value: 'Hackathon',  emoji: '⚡', color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
  { value: 'Submission', emoji: '📨', color: '#f43f5e', bg: 'rgba(244,63,94,0.15)'  },
  { value: 'Personal',   emoji: '🌱', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  { value: 'Exam',       emoji: '✏️', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
];

const PRIORITIES: { value: Priority; label: string; color: string; bg: string; desc: string }[] = [
  { value: 'auto',   label: 'Auto',   color: '#6366f1', bg: 'rgba(99,102,241,0.15)',  desc: 'Smart calc'  },
  { value: 'low',    label: 'Low',    color: '#10b981', bg: 'rgba(16,185,129,0.15)', desc: '3+ days'     },
  { value: 'medium', label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', desc: '1-3 days'    },
  { value: 'high',   label: 'High',   color: '#f43f5e', bg: 'rgba(244,63,94,0.15)',  desc: '<24 hours'   },
];

const defaultForm = (): FormData => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 0, 0);
  const dl = tomorrow.toISOString().slice(0, 16);
  return { title: '', description: '', category: 'Study', deadline: dl, priority: 'auto', reminders: defaultReminders(dl) };
};

export function EventModal({ event, onClose }: EventModalProps) {
  const { user } = useUserStore();
  const [form, setForm] = useState<FormData>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const isEditing = !!event;

  useEffect(() => {
    if (event) {
      const dl =
        event.deadline instanceof Timestamp
          ? toInputDatetimeLocal(event.deadline)
          : event.deadline?.slice(0, 16) ?? '';
      setForm({
        title: event.title,
        description: event.description,
        category: event.category,
        deadline: dl,
        priority: event.priority,
        reminders: (event.reminders as (Timestamp | string)[]).map((r) =>
          r instanceof Timestamp ? r.toDate().toISOString().slice(0, 16) : r.slice(0, 16)
        ),
      });
    }
  }, [event]);

  const handleDeadlineChange = (val: string) =>
    setForm((f) => ({ ...f, deadline: val, reminders: defaultReminders(val) }));

  const addReminder = () => {
    const d = new Date(form.deadline);
    d.setHours(d.getHours() - 2);
    setForm((f) => ({ ...f, reminders: [...f.reminders, d.toISOString().slice(0, 16)] }));
  };

  const removeReminder = (idx: number) =>
    setForm((f) => ({ ...f, reminders: f.reminders.filter((_, i) => i !== idx) }));

  const updateReminder = (idx: number, val: string) =>
    setForm((f) => ({ ...f, reminders: f.reminders.map((r, i) => (i === idx ? val : r)) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.deadline) return toast.error('Deadline is required');
    if (!user) return toast.error('Not authenticated');

    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        deadline: form.deadline,
        priority: form.priority,
        reminders: form.reminders,
        status: (isEditing ? event!.status : 'pending') as 'pending' | 'completed',
      };

      if (isEditing) {
        await updateEvent(event!.id, payload);
        toast.success('Deadline updated! ✏️');
      } else {
        await createEvent(user.uid, payload);
        toast.success('Deadline created! ⏱️');
      }
      setSuccess(true);
      setTimeout(() => onClose(), 400);
    } catch {
      toast.error('Failed to save. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string) => ({
    background: focusedField === field ? 'var(--bg-raised)' : 'var(--bg-elevated)',
    border: `1px solid ${focusedField === field ? '#7c3aed' : 'var(--border-dim)'}`,
    color: 'var(--text-bright)',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(124,58,237,0.12)' : 'none',
    transition: 'all 0.2s ease',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden',
          success ? 'animate-scale-in' : 'animate-scale-in'
        )}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-mid)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        {/* Gradient top bar */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #4f46e5, #7c3aed, #a855f7, #ec4899)' }} />

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-dim)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <Calendar size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base" style={{ color: 'var(--text-white)' }}>
                {isEditing ? 'Edit Deadline' : 'New Deadline'}
              </h2>
              <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                {isEditing ? 'Update deadline details' : 'Add a new deadline to track'}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl transition-all duration-200 hover:bg-white/8 hover:scale-110 active:scale-90">
            <X size={18} style={{ color: 'var(--text-mid)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Title */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-mid)' }}>
              <Zap size={11} style={{ color: '#f59e0b' }} /> Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              onFocus={() => setFocusedField('title')}
              onBlur={() => setFocusedField(null)}
              placeholder="e.g. Submit project report"
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={inputStyle('title')}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-mid)' }}>
              <AlignLeft size={11} style={{ color: '#8b5cf6' }} /> Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              onFocus={() => setFocusedField('desc')}
              onBlur={() => setFocusedField(null)}
              placeholder="Optional notes..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none"
              style={inputStyle('desc')}
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-mid)' }}>
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(({ value, emoji, color, bg }) => {
                const active = form.category === value;
                return (
                  <button key={value} type="button"
                    onClick={() => setForm((f) => ({ ...f, category: value }))}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 hover:scale-105 active:scale-95"
                    style={{
                      background: active ? color : bg,
                      color: active ? '#fff' : color,
                      border: `1px solid ${active ? 'transparent' : `${color}55`}`,
                      boxShadow: active ? `0 0 14px ${color}40` : 'none',
                    }}>
                    {emoji} {value}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-mid)' }}>
              Priority
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRIORITIES.map(({ value, label, color, bg, desc }) => {
                const active = form.priority === value;
                return (
                  <button key={value} type="button"
                    onClick={() => setForm((f) => ({ ...f, priority: value }))}
                    className="flex flex-col items-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-150 hover:scale-105 active:scale-95"
                    style={{
                      background: active ? color : bg,
                      color: active ? '#fff' : color,
                      border: `1px solid ${active ? 'transparent' : `${color}40`}`,
                      boxShadow: active ? `0 0 16px ${color}45` : 'none',
                    }}>
                    <span>{label}</span>
                    <span className="opacity-70 text-[9px] mt-0.5" style={{ color: active ? 'rgba(255,255,255,0.75)' : 'inherit' }}>{desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-mid)' }}>
              <Calendar size={11} style={{ color: '#06b6d4' }} /> Deadline *
            </label>
            <input
              type="datetime-local"
              value={form.deadline}
              onChange={(e) => handleDeadlineChange(e.target.value)}
              onFocus={() => setFocusedField('deadline')}
              onBlur={() => setFocusedField(null)}
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ ...inputStyle('deadline'), colorScheme: 'dark' }}
            />
          </div>

          {/* Reminders */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-mid)' }}>
                <BellRing size={11} style={{ color: '#f59e0b' }} /> Reminders
              </label>
              <button type="button" onClick={addReminder}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
                style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
                <Plus size={11} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {form.reminders.map((r, i) => (
                <div key={i} className="flex items-center gap-2 animate-fade-up">
                  <input
                    type="datetime-local"
                    value={r}
                    onChange={(e) => updateReminder(i, e.target.value)}
                    onFocus={() => setFocusedField(`rem-${i}`)}
                    onBlur={() => setFocusedField(null)}
                    className="flex-1 px-3 py-2 rounded-xl text-xs"
                    style={{ ...inputStyle(`rem-${i}`), colorScheme: 'dark' }}
                  />
                  <button type="button" onClick={() => removeReminder(i)}
                    className="p-2 rounded-xl transition-all hover:bg-rose-500/15 hover:scale-110 active:scale-90">
                    <Trash2 size={13} style={{ color: '#f43f5e' }} />
                  </button>
                </div>
              ))}
              {form.reminders.length === 0 && (
                <p className="text-xs py-2" style={{ color: 'var(--text-faint)' }}>No reminders set. Auto-reminders disabled.</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl font-semibold text-sm transition-all duration-200 hover:bg-white/5 active:scale-95"
              style={{ border: '1px solid var(--border-dim)', color: 'var(--text-mid)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm text-white transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}>
              {success ? (
                <CheckCircle2 size={16} />
              ) : loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Calendar size={16} />
              )}
              {success ? 'Saved!' : loading ? 'Saving...' : isEditing ? 'Update' : 'Create Deadline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
