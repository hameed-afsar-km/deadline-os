'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import { ArrowRight, Calendar, Bell, Zap, CheckCircle2, Shield, Layers, ChevronRight } from 'lucide-react';

const WORDS = ['assignments', 'hackathons', 'exams', 'submissions', 'projects'];

const FEATURES = [
  {
    icon: Zap,
    title: 'Smart Priority',
    desc: 'Auto-calculates urgency. High if <24h, Medium if <3 days — always know what to focus on.',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.2)',
  },
  {
    icon: Bell,
    title: 'Reminders',
    desc: 'Get notified before deadlines hit. Smart auto-scheduling keeps you ahead.',
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.2)',
  },
  {
    icon: Calendar,
    title: 'Visual Calendar',
    desc: 'Monthly view with event dots. Click any day to see what\'s due.',
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.2)',
  },
  {
    icon: CheckCircle2,
    title: 'Real-time Sync',
    desc: 'Firestore-powered. Change a deadline on your phone — it appears on your laptop instantly.',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.2)',
  },
  {
    icon: Shield,
    title: 'Private & Secure',
    desc: 'Your deadlines are yours only. Firebase security rules protect every record.',
    color: '#f43f5e',
    glow: 'rgba(244,63,94,0.2)',
  },
  {
    icon: Layers,
    title: 'Multi-category',
    desc: 'Study, Hackathon, Exam, Submission, Personal — color-coded for instant recognition.',
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.2)',
  },
];

const STATS = [
  { value: '∞', label: 'Deadlines tracked' },
  { value: '5', label: 'Categories' },
  { value: '100%', label: 'Cloud synced' },
  { value: '0', label: 'Missed deadlines' },
];

function Orb({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        filter: 'blur(80px)',
        ...style,
      }}
    />
  );
}

function Particle({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: 2,
        height: 2,
        background: 'rgba(139,92,246,0.8)',
        animation: 'particle 3s ease-out forwards',
        ...style,
      }}
    />
  );
}

export default function HomePage() {
  const { user, loading } = useUserStore();
  const router = useRouter();
  const [wordIdx, setWordIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  // Typewriter
  useEffect(() => {
    const word = WORDS[wordIdx];
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 90);
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 45);
    } else {
      setDeleting(false);
      setWordIdx((i) => (i + 1) % WORDS.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, wordIdx]);

  // Mouse tracker for orb parallax
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  // Spawn particles periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now();
      setParticles((p) => [
        ...p.slice(-15),
        { id, x: Math.random() * 100, y: Math.random() * 100, delay: Math.random() * 1000 },
      ]);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg-void)' }}>

      {/* ── Ambient Orbs ─────── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <Orb style={{
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(124,58,237,0.18), transparent 70%)',
          top: '-10%', left: '-5%',
          transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`,
          transition: 'transform 0.8s ease',
          animation: 'orb-drift 18s ease-in-out infinite',
        }} />
        <Orb style={{
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(236,72,153,0.12), transparent 70%)',
          bottom: '-5%', right: '-5%',
          transform: `translate(${-mousePos.x * 20}px, ${-mousePos.y * 20}px)`,
          transition: 'transform 0.8s ease',
          animation: 'orb-drift-2 22s ease-in-out infinite',
        }} />
        <Orb style={{
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(6,182,212,0.08), transparent 70%)',
          top: '40%', left: '60%',
          animation: 'orb-drift 26s ease-in-out infinite reverse',
        }} />
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }} />
        {/* Floating particles */}
        {particles.map((p) => (
          <Particle key={p.id} style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${p.delay}ms` }} />
        ))}
      </div>

      {/* ── Navbar ─────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 glass-mid"
        style={{ borderBottom: '1px solid var(--border-dim)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center animate-pulse-glow"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #ec4899)' }}>
            <span className="text-white font-black text-sm">D</span>
          </div>
          <span className="text-xl font-black gradient-text tracking-tight">DeadlineOS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login"
            className="text-sm font-medium px-5 py-2 rounded-xl transition-all duration-200 hover:bg-white/5"
            style={{ color: 'var(--text-mid)' }}>
            Sign In
          </Link>
          <Link href="/signup"
            className="magnetic-btn text-sm font-bold px-5 py-2.5 rounded-xl text-white glow-indigo"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            Get Started →
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────── */}
      <section ref={heroRef} className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 py-24 md:py-32">
        {/* Badge */}
        <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8"
          style={{
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.3)',
            color: '#a5b4fc',
            animationDelay: '0ms',
          }}>
          <Zap size={12} style={{ color: '#f59e0b' }} />
          Smart Deadline Management · Powered by AI Priority
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Main Heading */}
        <h1 className="animate-fade-up text-5xl md:text-7xl lg:text-8xl font-black mb-4 leading-none tracking-tight"
          style={{ animationDelay: '80ms', color: 'var(--text-white)' }}>
          Never miss a<br />
          <span className="gradient-text">deadline</span>
        </h1>

        {/* Typewriter */}
        <div className="animate-fade-up mb-8 h-14 flex items-center justify-center"
          style={{ animationDelay: '160ms' }}>
          <span className="text-2xl md:text-3xl font-semibold" style={{ color: 'var(--text-mid)' }}>
            Track your{' '}
            <span style={{ color: 'var(--violet-bright)', textShadow: '0 0 20px rgba(139,92,246,0.5)' }}>
              {displayed}
            </span>
            <span className="ml-0.5 border-r-2 border-violet-400 animate-[typing-blink_0.9s_ease-in-out_infinite]" style={{ animation: 'typing-blink 0.9s ease-in-out infinite' }}>&nbsp;</span>
          </span>
        </div>

        <p className="animate-fade-up text-base md:text-lg max-w-lg mx-auto mb-10 leading-relaxed"
          style={{ color: 'var(--text-mid)', animationDelay: '240ms' }}>
          Intelligent reminders, auto-priority scoring, and real-time sync across all your devices.
          Stop forgetting. Start delivering.
        </p>

        {/* CTAs */}
        <div className="animate-fade-up flex flex-col sm:flex-row items-center gap-4"
          style={{ animationDelay: '320ms' }}>
          <Link href="/signup"
            className="magnetic-btn group flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white text-base glow-violet"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7)' }}>
            Start for Free
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/login"
            className="group flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-200 hover:bg-white/5"
            style={{ border: '1px solid var(--border-mid)', color: 'var(--text-mid)' }}>
            Sign In
            <ChevronRight size={16} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        {/* Stats Row */}
        <div className="animate-fade-up flex flex-wrap justify-center gap-8 mt-16"
          style={{ animationDelay: '400ms' }}>
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-black gradient-text">{value}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ──── */}
      <section className="relative z-10 px-6 pb-24 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Everything you need</h2>
          <p style={{ color: 'var(--text-mid)' }}>to stay on top of every deadline</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, color, glow }, i) => (
            <div
              key={title}
              className="card-hover group animate-fade-up rounded-2xl p-6 cursor-default"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-dim)',
                animationDelay: `${(i + 1) * 60}ms`,
              }}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                style={{ background: glow, boxShadow: `0 0 20px ${glow}` }}>
                <Icon size={22} style={{ color }} />
              </div>
              <h3 className="font-bold text-base mb-2" style={{ color: 'var(--text-white)' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>{desc}</p>

              {/* Hover glow bar */}
              <div className="mt-4 h-0.5 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ─────── */}
      <section className="relative z-10 px-6 pb-16">
        <div className="max-w-3xl mx-auto rounded-3xl p-px"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.5), rgba(124,58,237,0.5), rgba(236,72,153,0.3))' }}>
          <div className="rounded-3xl p-10 text-center" style={{ background: 'var(--bg-elevated)' }}>
            <h2 className="text-3xl font-black mb-3 gradient-text">Ready to take control?</h2>
            <p className="mb-8" style={{ color: 'var(--text-mid)' }}>
              Join thousands who never miss a deadline again.
            </p>
            <Link href="/signup"
              className="magnetic-btn inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-white text-base glow-violet"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7)' }}>
              Get Started Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────── */}
      <footer className="relative z-10 text-center py-6 text-xs" style={{ color: 'var(--text-faint)', borderTop: '1px solid var(--border-dim)' }}>
        © {new Date().getFullYear()} DeadlineOS · Built with Next.js + Firebase · 
        <span className="gradient-text font-semibold ml-1">Never miss again.</span>
      </footer>
    </main>
  );
}
