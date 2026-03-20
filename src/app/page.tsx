'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, BarChart2, CheckCircle2 } from 'lucide-react';

const FEATURES = [
  { icon: Zap,      label: 'Hyper-Priority', c: '#8B5CF6', t: 'Violet Glow', desc: 'Deep-learning priority engine that re-ranks your flow as the clock runs out.' },
  { icon: BarChart2, label: 'Momentum OS',    c: '#F97316', t: 'Orange Heat', desc: 'Real-time velocity tracking. Watch your productivity surface as a physical trend.' },
  { icon: Shield,    label: 'Fort Knox Sync',  c: '#06B6D4', t: 'Cyan Edge',   desc: 'Ultra-secure Firestore cloud clustering. Your deadlines remain immutable.' },
];

export default function HomePage() {
  const { user, loading } = useUserStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (!loading && user) router.replace('/dashboard'); }, [user, loading, router]);

  if (!mounted) return null;

  return (
    <main className="flex flex-col min-h-screen relative overflow-hidden bg-[#020617] text-white">
      {/* ── Fixed Structural Elements ── */}
      <div className="absolute top-0 left-0 w-full h-[1px] opacity-10" style={{ background: 'linear-gradient(90deg, transparent, #fff, transparent)' }} />
      <div className="absolute left-[8%] top-0 bottom-0 w-[1px] bg-white/5 hidden lg:block" />
      <div className="absolute right-[8%] top-0 bottom-0 w-[1px] bg-white/5 hidden lg:block" />

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 h-20 flex items-center justify-between px-6 lg:px-[10%] backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-lg bg-violet-600 shadow-[0_0_15px_rgba(139,92,246,0.5)]">
            D
          </div>
          <span className="font-black text-xl tracking-tighter">Deadline<span className="text-violet-500">OS</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/login">
            <button className="px-6 py-2.5 text-sm font-bold text-slate-300 hover:text-white transition-colors">Sign in</button>
          </Link>
          <Link href="/signup">
            <button className="px-6 py-2.5 text-sm font-bold rounded-xl bg-violet-600 hover:bg-violet-500 shadow-[0_4px_15px_rgba(139,92,246,0.3)] transition-all">
              Initialize →
            </button>
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 px-6 lg:px-[10%] flex flex-col items-start gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          className="px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-mono font-bold tracking-widest uppercase"
        >
          // VERSION 4.0 // ACTIVE_SYNC
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
          className="text-6xl lg:text-9xl font-black leading-[0.85] tracking-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          ENGINEERED <br /> FOR <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-500 to-orange-500">MOMENTUM.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-xl text-lg lg:text-2xl text-slate-400 leading-relaxed font-medium"
        >
          The first deadline intelligence environment with real-time priority clustering. Abandon lists. Embrace flow.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-wrap gap-4 mt-4"
        >
          <Link href="/signup">
            <button className="group px-8 py-5 text-lg font-black rounded-2xl bg-violet-600 hover:bg-violet-500 shadow-[0_10px_30px_rgba(139,92,246,0.4)] transition-all flex items-center gap-3">
              Start Building <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <div className="flex items-center gap-3 px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-sm font-bold uppercase tracking-widest">
            <CheckCircle2 size={18} className="text-emerald-400" />
            100% Edge Decoupled
          </div>
        </motion.div>
      </section>

      {/* ── Features Grid ── */}
      <section className="px-6 lg:px-[10%] pb-32 grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURES.map(({ icon:Icon, label, c, t, desc }, i) => (
          <motion.div 
            key={label}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}
            className="group relative p-8 cyber-panel glass-card cursor-default overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10 transition-all group-hover:opacity-20 translate-x-1/3 -translate-y-1/3" style={{ background: c, filter: 'blur(30px)' }} />
            
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-10 transition-all group-hover:scale-110 group-hover:rotate-6" style={{ background: `${c}20`, border: `1px solid ${c}40` }}>
              <Icon size={24} style={{ color: c }} />
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: c }}>// {t}</p>
            <h3 className="text-3xl font-black mb-4 tracking-tighter">{label}</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">{desc}</p>
          </motion.div>
        ))}
      </section>

      {/* ── Stats Band ── */}
      <section className="border-y border-white/5 py-12 px-6 lg:px-[10%] flex flex-wrap items-center justify-between gap-12 bg-white/[0.02]">
        {[{ n: '12K', l: 'Active Containers' }, { n: '0.0s', l: 'Sync Latency' }, { n: '98%', l: 'Momentum Efficiency' }].map(({ n, l }) => (
          <div key={l} className="flex flex-col items-start">
            <span className="text-4xl lg:text-6xl font-black tracking-tighter" style={{ fontFamily: 'var(--font-heading)' }}>{n}</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-500/80 mt-1">{l}</span>
          </div>
        ))}
      </section>

      {/* ── Footer ── */}
      <footer className="pt-24 pb-12 px-6 lg:px-[10%] border-t border-white/5 flex flex-col items-center gap-12">
        <h2 className="text-4xl lg:text-7xl font-black tracking-tighter text-center max-w-2xl">OWN THE <span className="text-violet-500">COMMAND</span> CHAIN.</h2>
        <Link href="/signup">
          <button className="px-12 py-6 text-xl font-black rounded-2xl bg-white text-black hover:bg-slate-100 shadow-[0_10px_40px_rgba(255,255,255,0.2)] transition-all">
            Join the Matrix →
          </button>
        </Link>
        <p className="text-slate-500 text-[10px] font-bold mono tracking-[0.2em] mt-8 uppercase">© 2026 DEADLINEOS. PERFORMANCE FIRST.</p>
      </footer>
    </main>
  );
}
