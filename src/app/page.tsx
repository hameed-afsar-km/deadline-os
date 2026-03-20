'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, CheckCircle2, Zap, Users, Shield, Star, Sparkles, TrendingUp } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial:  { opacity: 0, y: 24 },
  animate:  { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as any },
});

const TESTIMONIALS = [
  { name: 'Priya S.',   role: 'CS Student',       text: "Finally I don't miss deadlines. The auto-priority is genuinely magic.",     avatar: '🧑‍💻' },
  { name: 'James K.',   role: 'Startup Founder',  text: "I manage 6 hackathons simultaneously. DeadlineOS is the only tool keeping me sane.", avatar: '🚀' },
  { name: 'Aisha M.',   role: 'Graduate Researcher', text: "My thesis submissions never slipped again after I started using this.", avatar: '📚' },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'Auto-Priority Engine',
    desc: "Deadlines auto-rank themselves as time runs out. You always know what needs attention — without thinking about it.",
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.15)',
  },
  {
    icon: Clock,
    title: 'Live Countdowns',
    desc: "Real-time ticking clocks on every card. The urgency is visible, not buried in a date field you forget to check.",
    color: '#67E8F9',
    glow: 'rgba(103,232,249,0.12)',
  },
  {
    icon: CheckCircle2,
    title: 'Satisfying Completions',
    desc: "Check something off and feel it. Smooth animations, progress tracking, and a velocity score that celebrates momentum.",
    color: '#34D399',
    glow: 'rgba(52,211,153,0.12)',
  },
  {
    icon: Shield,
    title: 'Secure Everywhere',
    desc: "Your data lives in Firestore with row-level security rules. No one sees your work except you.",
    color: '#C4B5FD',
    glow: 'rgba(196,181,253,0.12)',
  },
];

const STATS = [
  { val: '12,000+', label: 'Students & founders using it' },
  { val: '94%',     label: 'Report fewer missed deadlines' },
  { val: '4.9★',    label: 'Average user rating' },
  { val: 'Free',    label: 'Always — no hidden costs' },
];

export default function HomePage() {
  const { user, loading } = useUserStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (!loading && user) router.replace('/dashboard'); }, [user, loading, router]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen flex flex-col">

      {/* ── NAVBAR ─────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-14 h-[66px] border-b"
        style={{ borderColor: 'var(--b1)', background: 'rgba(12,10,9,0.85)', backdropFilter: 'blur(24px)' }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #B45309)', color: '#0C0A09' }}
          >
            D
          </motion.div>
          <span className="text-base font-bold tracking-tight" style={{ color: 'var(--t0)' }}>DeadlineOS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <motion.span
              whileHover={{ color: 'var(--t0)' }}
              className="text-sm font-semibold px-3 py-2 transition-colors"
              style={{ color: 'var(--t2)' }}
            >
              Log in
            </motion.span>
          </Link>
          <Link href="/signup">
            <motion.span
              whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(245,158,11,0.35)' }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #B45309)', color: '#0C0A09' }}
            >
              Get started free <ArrowRight size={14} />
            </motion.span>
          </Link>
        </div>
      </motion.header>

      {/* ── HERO ───────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 md:py-28 text-center relative max-w-[1200px] mx-auto w-full">

        <motion.div {...fadeUp(0.1)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <Sparkles size={14} className="text-amber-400" style={{ color: 'var(--amber)' }} />
          <span className="text-xs font-bold" style={{ color: 'var(--amber)' }}>Built for students, founders, and anyone who ships</span>
        </motion.div>

        <motion.h1
          {...fadeUp(0.15)}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 max-w-3xl"
          style={{ color: 'var(--t0)' }}
        >
          Stop juggling deadlines in{' '}
          <span className="amber-text">your head.</span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.22)}
          className="text-lg md:text-xl font-medium leading-relaxed mb-10 max-w-xl"
          style={{ color: 'var(--t2)' }}
        >
          DeadlineOS watches your deadlines so you don&apos;t have to. Auto-priority, live countdowns, and a workspace that feels like it understands you.
        </motion.p>

        <motion.div {...fadeUp(0.28)} className="flex flex-col sm:flex-row gap-4 items-center mb-16">
          <Link href="/signup">
            <motion.span
              whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(245,158,11,0.4), 0 0 80px rgba(245,158,11,0.15)' }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #B45309)', color: '#0C0A09' }}
            >
              Start free — takes 30 seconds <ArrowRight size={18} />
            </motion.span>
          </Link>
          <span className="text-sm font-medium" style={{ color: 'var(--t3)' }}>
            No credit card. No setup, just focus.
          </span>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          {...fadeUp(0.35)}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-3xl"
        >
          {STATS.map(({ val, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-2xl font-extrabold amber-text">{val}</span>
              <span className="text-xs font-medium text-center" style={{ color: 'var(--t3)' }}>{label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURES ───────────────────────────────── */}
      <section className="px-6 md:px-14 py-20 max-w-[1200px] mx-auto w-full">
        <motion.div {...fadeUp(0)} className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--amber)' }}>Why it works</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--t0)' }}>
            Designed around how humans<br />actually think about time.
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, color, glow }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.09, duration: 0.55, ease: [0.22, 1, 0.36, 1] as any }}
              whileHover={{ y: -4, borderColor: `${color}40`, boxShadow: `0 20px 60px rgba(0,0,0,0.4), inset 0 0 40px ${glow}` }}
              className="card p-7 cursor-default group transition-all"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all group-hover:scale-110"
                style={{ background: glow, border: `1px solid ${color}30` }}
              >
                <Icon size={22} style={{ color }} />
              </div>
              <h3 className="text-lg font-bold mb-2.5" style={{ color: 'var(--t0)' }}>{title}</h3>
              <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--t2)' }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────── */}
      <section className="px-6 md:px-14 py-20 max-w-[1200px] mx-auto w-full">
        <motion.div {...fadeUp(0)} className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--emerald)' }}>Real people, real results</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--t0)' }}>
            People love how it feels.
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(({ name, role, text, avatar }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, borderColor: 'var(--b2)' }}
              className="card p-6 cursor-default"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} style={{ color: 'var(--amber)', fill: 'var(--amber)' }} />
                ))}
              </div>
              <p className="text-sm font-medium leading-relaxed mb-5" style={{ color: 'var(--t1)' }}>
                &ldquo;{text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-base"
                  style={{ background: 'var(--s3)' }}>
                  {avatar}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--t0)' }}>{name}</p>
                  <p className="text-xs font-medium" style={{ color: 'var(--t3)' }}>{role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────── */}
      <section className="px-6 md:px-14 py-16 max-w-[1200px] mx-auto w-full pb-24">
        <motion.div
          {...fadeUp(0)}
          className="rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
          style={{ background: 'var(--s1)', border: '1px solid var(--b2)' }}
        >
          {/* Glow center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
            <div className="w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, var(--amber) 0%, transparent 70%)', filter: 'blur(80px)' }} />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <TrendingUp size={14} style={{ color: 'var(--amber)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--amber)' }}>Join the focused</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4" style={{ color: 'var(--t0)' }}>
              Your next deadline<br />deserves your best.
            </h2>
            <p className="text-lg font-medium mb-10 max-w-md mx-auto" style={{ color: 'var(--t2)' }}>
              Start free. Stay focused. Ship what matters.
            </p>
            <Link href="/signup">
              <motion.span
                whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(245,158,11,0.5)' }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2.5 px-10 py-4.5 rounded-2xl text-lg font-bold"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #B45309)', color: '#0C0A09' }}
              >
                Create my account — it&apos;s free <ArrowRight size={20} />
              </motion.span>
            </Link>
            <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
              {['No credit card', 'Cancel anytime', 'Free forever plan'].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--t3)' }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--emerald)' }} /> {t}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 md:px-14 py-6 flex items-center justify-between" style={{ borderColor: 'var(--b1)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #B45309)', color: '#0C0A09' }}>D</div>
          <span className="text-sm font-bold" style={{ color: 'var(--t0)' }}>DeadlineOS</span>
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--t4)' }}>© {new Date().getFullYear()} · Built with care</span>
      </footer>

    </main>
  );
}
