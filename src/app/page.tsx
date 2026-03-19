'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Calendar, Zap, Shield, Sparkles, LayoutGrid, Clock, CheckCircle2, Star, TrendingUp } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial:  { opacity: 0, y: 30 },
  animate:  { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as any },
});

const TICKER = ['SMART PRIORITY', 'LIVE COUNTDOWNS', 'FIRE CALENDAR', 'ENTERPRISE SYNC', 'BENTO WORKSPACE', 'AUTO SORTING', 'REAL-TIME CLOUD', 'DEADLINE OS'];

export default function HomePage() {
  const { user, loading } = useUserStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (!loading && user) router.replace('/dashboard'); }, [user, loading, router]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--paper)' }}>

      {/* ── NAVBAR ───────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between px-6 md:px-12 py-5 border-b-2 sticky top-0 z-50"
        style={{ borderColor: 'var(--ink)', background: 'var(--paper)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-white text-base"
            style={{ background: 'var(--ink)' }}
          >
            D/
          </div>
          <span className="font-display font-black text-xl tracking-tight" style={{ color: 'var(--ink)' }}>
            DeadlineOS
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {['Features', 'Pricing', 'Docs'].map(l => (
            <a key={l} href="#" className="text-sm font-semibold transition-colors hover:opacity-70" style={{ color: 'var(--ink-3)' }}>{l}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <motion.span
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="hidden sm:inline-flex px-4 py-2 text-sm font-bold border-2 rounded-xl transition-colors btn-primary"
            >
              Log in
            </motion.span>
          </Link>
          <Link href="/signup">
            <motion.span
              whileHover={{ x: -2, y: -2, boxShadow: '4px 4px 0 var(--ink)' }}
              whileTap={{ x: 0, y: 0, boxShadow: 'none' }}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl"
              style={{ background: 'var(--accent)', color: '#fff', border: '2px solid var(--ink)' }}
            >
              Get started <ArrowRight size={16} />
            </motion.span>
          </Link>
        </div>
      </motion.header>

      {/* ── TICKER TAPE ─────────────────────────────────────── */}
      <div
        className="flex overflow-hidden border-b-2 py-3 select-none"
        style={{ borderColor: 'var(--border)', background: 'var(--ink)', color: 'var(--paper)' }}
      >
        <div className="flex shrink-0 animate-marquee">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-4 px-6 text-xs font-black uppercase tracking-[0.15em] whitespace-nowrap">
              {t} <span className="opacity-40">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 pt-16 pb-8 max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left — Big Title */}
          <div>
            <motion.div {...fadeUp(0.1)} className="inline-flex items-center gap-2 mb-6">
              <span
                className="tag"
                style={{ color: 'var(--accent)', borderColor: 'var(--accent)', background: 'rgba(255,85,51,0.06)' }}
              >
                <Sparkles size={11} /> New · Season 2026
              </span>
            </motion.div>
            <motion.h1
              {...fadeUp(0.15)}
              className="font-display font-black leading-[0.95] tracking-tighter mb-6"
              style={{ fontSize: 'clamp(3.5rem, 7vw, 7rem)', color: 'var(--ink)' }}
            >
              Dead&shy;line<br />
              <span style={{ color: 'var(--accent)' }}>OS.</span>
            </motion.h1>
            <motion.p
              {...fadeUp(0.25)}
              className="text-lg md:text-xl font-medium max-w-md leading-relaxed mb-10"
              style={{ color: 'var(--ink-3)' }}
            >
              The sharpest deadline tracker ever built. Auto-priority engine, live countdowns, bento workspace — all in one place.
            </motion.p>
            <motion.div {...fadeUp(0.3)} className="flex flex-wrap gap-4">
              <Link href="/signup">
                <motion.span
                  whileHover={{ x: -3, y: -3, boxShadow: '6px 6px 0 var(--ink)' }}
                  whileTap={{ x: 0, y: 0, boxShadow: 'none' }}
                  className="inline-flex items-center gap-2.5 px-8 py-4 text-base font-black rounded-xl"
                  style={{ background: 'var(--accent)', color: '#fff', border: '2.5px solid var(--ink)' }}
                >
                  Start free — it's fast <ArrowRight size={18} />
                </motion.span>
              </Link>
              <Link href="/login">
                <motion.span
                  whileHover={{ y: -2 }}
                  className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold rounded-xl border-2"
                  style={{ borderColor: 'var(--border)', color: 'var(--ink-3)', background: 'var(--white)' }}
                >
                  Sign in
                </motion.span>
              </Link>
            </motion.div>
          </div>

          {/* Right — Promo Card Stack */}
          <motion.div {...fadeUp(0.2)} className="relative grid grid-cols-2 gap-4 lg:ml-auto lg:w-[440px]">

            <motion.div
              whileHover={{ y: -4, boxShadow: '6px 6px 0 var(--ink)' }}
              className="col-span-2 p-6 rounded-2xl border-2 cursor-default"
              style={{ borderColor: 'var(--ink)', background: 'var(--white)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: 'var(--ink-4)' }}>Priority Focus</span>
                <span className="tag" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>🔥 High</span>
              </div>
              <p className="font-display font-bold text-xl" style={{ color: 'var(--ink)' }}>Submit Capstone Project</p>
              <div className="flex items-center gap-2 mt-3 text-sm font-semibold" style={{ color: 'var(--ink-4)' }}>
                <Clock size={14} /> 6h 24m remaining
              </div>
              <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ background: 'var(--paper-2)' }}>
                <div className="h-full rounded-full" style={{ width: '73%', background: 'var(--accent)' }} />
              </div>
            </motion.div>

            {[
              { label: 'Total', val: '24', icon: LayoutGrid, color: 'var(--accent-2)' },
              { label: 'Due Today', val: '6', icon: Clock, color: 'var(--accent)' },
              { label: 'Overdue', val: '2', icon: TrendingUp, color: 'var(--rose)' },
              { label: 'Done', val: '71%', icon: CheckCircle2, color: 'var(--accent-3)' },
            ].map(({ label, val, icon: Icon, color }) => (
              <motion.div
                key={label}
                whileHover={{ y: -4, boxShadow: '5px 5px 0 var(--ink)' }}
                className="p-5 rounded-2xl border-2 flex flex-col gap-2 cursor-default"
                style={{ borderColor: 'var(--border)', background: 'var(--white)' }}
              >
                <Icon size={20} style={{ color }} />
                <div className="font-display font-black text-3xl" style={{ color: 'var(--ink)' }}>{val}</div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--ink-4)' }}>{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES GRID ───────────────────────────────────── */}
      <section className="px-6 md:px-12 py-16 max-w-[1400px] mx-auto w-full">
        <motion.div {...fadeUp(0)} className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-0.5" style={{ background: 'var(--border)' }} />
          <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--ink-4)' }}>Features</span>
          <div className="flex-1 h-0.5" style={{ background: 'var(--border)' }} />
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: Zap,          color: 'var(--amber)',   title: 'Smart Priority',    desc: 'AI-ranked queue that auto-reorders as deadlines approach.' },
            { icon: Calendar,     color: 'var(--accent-2)', title: 'Visual Calendar',   desc: "Bird's-eye temporal map. Click any day to view work." },
            { icon: Shield,       color: 'var(--accent-3)', title: 'Enterprise Sync',   desc: 'Firestore-backed real-time sync with military-grade rules.' },
            { icon: Star,         color: 'var(--accent)',   title: 'Completion Score',  desc: 'Track velocity. See your completion rate rise in real-time.' },
            { icon: LayoutGrid,   color: 'var(--accent-2)', title: 'Bento Layout',      desc: 'Dense, spatial information design that respects your focus.' },
            { icon: CheckCircle2, color: 'var(--accent-3)', title: 'Instant Complete',  desc: 'One-click task completion with smooth animated state changes.' },
          ].map(({ icon: Icon, color, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] as any }}
              whileHover={{ y: -4, boxShadow: '5px 5px 0 var(--ink)' }}
              className="p-7 rounded-2xl border-2 cursor-default transition-all"
              style={{ borderColor: 'var(--border)', background: 'var(--white)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 border-2"
                style={{ background: `${color}15`, borderColor: `${color}40` }}
              >
                <Icon size={22} style={{ color }} />
              </div>
              <h3 className="font-display font-bold text-lg mb-2" style={{ color: 'var(--ink)' }}>{title}</h3>
              <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--ink-4)' }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────── */}
      <section className="px-6 md:px-12 pb-20 max-w-[1400px] mx-auto w-full">
        <motion.div
          {...fadeUp(0)}
          whileHover={{ scale: 1.005 }}
          className="rounded-3xl border-2 p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8"
          style={{ borderColor: 'var(--ink)', background: 'var(--ink)', color: 'var(--paper)' }}
        >
          <div>
            <h2 className="font-display font-black text-4xl md:text-5xl leading-tight tracking-tighter mb-3">
              Your next deadline<br />won't wait.
            </h2>
            <p className="text-lg font-medium opacity-60">Start for free. No card needed. Cancel whenever.</p>
          </div>
          <Link href="/signup" className="shrink-0">
            <motion.span
              whileHover={{ x: -3, y: -3, boxShadow: '6px 6px 0 var(--accent)' }}
              whileTap={{ x: 0, y: 0, boxShadow: 'none' }}
              className="inline-flex items-center gap-3 px-10 py-5 text-lg font-black rounded-2xl"
              style={{ background: 'var(--accent)', color: '#fff', border: '2.5px solid var(--accent)' }}
            >
              Create account <ArrowRight size={22} />
            </motion.span>
          </Link>
        </motion.div>
      </section>

      <footer className="border-t-2 px-6 md:px-12 py-6 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <span className="font-black text-sm" style={{ color: 'var(--ink)' }}>DeadlineOS</span>
        <span className="text-xs font-semibold" style={{ color: 'var(--ink-4)' }}>© {new Date().getFullYear()} · All rights reserved</span>
      </footer>
    </main>
  );
}
