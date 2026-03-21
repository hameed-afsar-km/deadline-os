'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, AnimatePresence, type Variants } from 'framer-motion';
import { ArrowRight, CheckCircle2, Zap, BarChart3, ShieldCheck, Clock, ChevronDown } from 'lucide-react';
import { EtherealShadow } from '@/components/ui/etheral-shadow';

/* ── Data ── */
const FEATURES = [
  {
    icon: Zap,
    color: '#7C3AED',
    title: 'Auto-Priority Engine',
    desc: 'Your tasks self-organize by urgency. Tasks due in less than 24h automatically escalate to High priority.',
  },
  {
    icon: BarChart3,
    color: '#0EA5E9',
    title: 'Live Analytics',
    desc: 'Monitor your velocity, completion rate, and overdue trends through an always-updated analytics panel.',
  },
  {
    icon: ShieldCheck,
    color: '#10B981',
    title: 'Secure Cloud Sync',
    desc: 'All deadlines are encrypted and synced via Firebase in real-time across every device you own.',
  },
  {
    icon: Clock,
    color: '#F59E0B',
    title: 'Smart Countdowns',
    desc: 'Live countdown timers with human-readable labels — days, hours, and minutes remaining at a glance.',
  },
];

const STATS = [
  { value: '12k+', label: 'Tasks Managed' },
  { value: '98%',  label: 'Uptime' },
  { value: '3x',   label: 'Faster Completion' },
  { value: '100%', label: 'Free to Start' },
];

/* ── Stagger container ── */
const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } },
};

export default function HomePage() {
  const { user, loading } = useUserStore();
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY  = useTransform(scrollY, [0, 500], [0, -80]);
  const heroOp = useTransform(scrollY, [0, 300], [1, 0]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (!loading && user) router.replace('/dashboard'); }, [user, loading, router]);

  if (!mounted) return null;

  return (
    <main className="flex flex-col min-h-screen overflow-hidden font-[var(--font-inter)]">

      {/* ── Topbar ── */}
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 inset-x-0 z-50 h-16 flex items-center justify-between px-6 lg:px-16 glass border-b border-white/5"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl grad-accent flex items-center justify-center text-white font-extrabold text-sm glow-accent">D</span>
          <span className="font-bold text-[1.05rem] tracking-tight text-white">DeadlineOS</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[--c-muted]">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#stats"    className="hover:text-white transition-colors">Stats</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <button className="px-4 py-2 rounded-xl text-sm font-semibold text-[--c-muted] hover:text-white transition-colors">Sign in</button>
          </Link>
          <Link href="/signup">
            <button className="px-5 py-2 rounded-xl text-sm font-bold text-white grad-accent hover:opacity-90 transition-opacity shadow-[0_4px_20px_rgba(124,58,237,0.4)]">
              Get Started
            </button>
          </Link>
        </div>
      </motion.header>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 overflow-hidden">

        {/* Etheral Shadow Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <EtherealShadow
            color="rgba(109, 40, 217, 0.85)"
            animation={{ scale: 100, speed: 70 }}
            noise={{ opacity: 0.6, scale: 1.2 }}
            sizing="fill"
            style={{ width: '100%', height: '100%' }}
          />
          {/* Darken the effect so text remains readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/60 via-[#0A0A0F]/30 to-[#0A0A0F]/80" />
        </div>

        {/* Hero content — sits above the background */}
        <motion.div style={{ y: heroY, opacity: heroOp }} className="relative z-10 flex flex-col items-center max-w-4xl mx-auto gap-7">

          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
            className="pill glass-hi text-[--c-accent] border border-violet-500/20 text-[0.7rem] gap-2 px-4 py-1.5 shadow-[0_0_20px_rgba(124,58,237,0.2)]">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            Version 4.0 — Now with Real-Time Sync
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tighter leading-[1.05] drop-shadow-2xl"
          >
            The deadline manager<br />
            <span className="text-grad">that thinks for you.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-2xl text-lg text-zinc-300 font-medium leading-relaxed drop-shadow-lg"
          >
            DeadlineOS automatically prioritizes your tasks, syncs them across all your devices in real-time,
            and gives you a command-center overview of your entire schedule.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup">
              <button className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white grad-accent glow-accent hover:opacity-90 transition-all active:scale-95 shadow-2xl">
                Start for free <ArrowRight size={18} />
              </button>
            </Link>
            <Link href="/login">
              <button className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white glass-hi border border-white/20 hover:border-white/40 transition-all active:scale-95 backdrop-blur-xl">
                Sign in
              </button>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-wrap justify-center gap-6 text-xs text-zinc-400 font-medium mt-2">
            {['No credit card required', 'Free forever plan', 'Real-time cloud sync'].map(t => (
              <span key={t} className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-400" />{t}</span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-10 z-10 flex flex-col items-center gap-2 text-zinc-400">
          <span className="text-xs font-medium tracking-wide">Scroll to explore</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
            <ChevronDown size={18} />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section id="stats" className="py-24 px-6">
        <motion.div
          variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}
          className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {STATS.map(({ value, label }) => (
            <motion.div key={label} variants={fadeUp} className="glass-hi rounded-2xl p-8 flex flex-col items-center gap-2 text-center card-lift">
              <span className="text-4xl font-extrabold tracking-tighter text-grad">{value}</span>
              <span className="text-sm text-[--c-muted] font-medium">{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="flex flex-col items-center text-center mb-16 gap-4">
            <motion.div variants={fadeUp} className="pill glass border border-violet-500/20 text-violet-400">Core Capabilities</motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white">Everything you need,<br />nothing you don't.</motion.h2>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map(({ icon: Icon, color, title, desc }) => (
              <motion.div key={title} variants={fadeUp}
                className="glass-hi rounded-3xl p-8 flex gap-6 card-lift group cursor-default relative overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 30% 50%, ${color}18 0%, transparent 65%)` }} />
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center relative"
                  style={{ background: `${color}18`, border: `1px solid ${color}35` }}>
                  <Icon size={24} style={{ color }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{title}</h3>
                  <p className="text-sm text-[--c-muted] leading-relaxed font-medium">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-32 px-6">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto glass-hi rounded-3xl p-14 flex flex-col items-center text-center gap-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 50% 0%, #7C3AED, transparent 65%)' }} />
          <h2 className="relative text-4xl md:text-5xl font-extrabold tracking-tighter text-white">Take back control<br />of your schedule.</h2>
          <p className="relative text-[--c-muted] text-lg font-medium max-w-xl">Join thousands of professionals who trust DeadlineOS to organize their most critical work.</p>
          <Link href="/signup">
            <button className="relative flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-bold text-white grad-accent glow-accent hover:opacity-90 transition-opacity active:scale-95">
              Create free account <ArrowRight size={18} />
            </button>
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto py-12 px-6 border-t border-white/5 text-center text-sm text-[--c-muted]">
        <p>© {new Date().getFullYear()} DeadlineOS. Built with Next.js, Firebase & Framer Motion.</p>
      </footer>
    </main>
  );
}
