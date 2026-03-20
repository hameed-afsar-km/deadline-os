'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Zap, Shield, BarChart2, CheckCircle2 } from 'lucide-react';

const FEATURES = [
  { icon: Zap,       title: 'Intelligent Sorting', desc: 'Automatically re-prioritize your critical tasks as deadlines organically approach.' },
  { icon: BarChart2, title: 'Visual Productivity', desc: 'Track your completion metrics through crystal-clear data visualization panels.' },
  { icon: Shield,    title: 'Enterprise Security', desc: 'Your data is securely stored, encrypted, and synced across all your devices.' },
];

export default function HomePage() {
  const { user, loading } = useUserStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -100]);

  useEffect(() => { const timer = setTimeout(() => setMounted(true), 0); return () => clearTimeout(timer); }, []);
  useEffect(() => { if (!loading && user) router.replace('/dashboard'); }, [user, loading, router]);

  if (!mounted) return null;

  return (
    <main className="flex flex-col min-h-screen relative overflow-hidden font-sans">
      
      {/* ── Frosted Nav ── */}
      <header className="fixed top-0 inset-x-0 z-50 h-20 flex items-center justify-between px-6 lg:px-[10%] bg-black/10 backdrop-blur-2xl border-b border-white/5">
        <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            D
          </div>
          <span className="font-bold text-xl tracking-wide text-zinc-100">DeadlineOS</span>
        </motion.div>
        
        <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="flex items-center gap-4">
          <Link href="/login">
            <button className="px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors">Sign in</button>
          </Link>
          <Link href="/signup">
            <button className="px-6 py-2.5 text-sm font-semibold rounded-full bg-white text-black hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              Get Started
            </button>
          </Link>
        </motion.div>
      </header>

      {/* ── Hero ── */}
      <section className="relative pt-40 pb-32 px-6 flex flex-col items-center text-center max-w-5xl mx-auto w-full z-10">
        <motion.div 
          initial={{ opacity: 0, scale:0.9 }} animate={{ opacity: 1, scale:1 }} transition={{ duration: 0.6 }}
          className="px-5 py-2 mb-8 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-xs font-semibold tracking-widest uppercase backdrop-blur-md"
        >
          Waitlist Now Open — Version 4.0
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="text-6xl lg:text-[5.5rem] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-500 leading-tight mb-6"
        >
          Master your time. <br/> 
          Refined in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">Glass.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-2xl text-lg lg:text-xl text-zinc-400 leading-relaxed font-medium mx-auto mb-10"
        >
          A completely frictionless, high-aesthetic workflow engine built for modern professionals. Stay ahead of your deadlines without the visual noise.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-6"
        >
          <Link href="/signup">
            <button className="px-10 py-5 text-base font-bold rounded-full bg-white text-black hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center gap-3">
              Deploy Workspace <ArrowRight size={20} />
            </button>
          </Link>
          <div className="flex items-center justify-center gap-2 px-6 py-4 rounded-full text-zinc-300 text-sm font-medium glass-panel">
            <CheckCircle2 size={18} className="text-emerald-400" />
            No credit card required
          </div>
        </motion.div>
      </section>

      {/* ── Parallax Presentation Grid ── */}
      <motion.section style={{ y: y1 }} className="px-6 lg:px-[10%] max-w-[1400px] mx-auto w-full z-10 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon:Icon, title, desc }, i) => (
            <motion.div 
              key={title}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: i * 0.1, duration: 0.7 }}
              className="p-8 rounded-3xl glass-card relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mx-10 -my-10" />
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 bg-white/5 border border-white/10 text-cyan-400 shadow-[2px_4px_16px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500 relative z-10">
                <Icon size={26} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-white mb-3 relative z-10">{title}</h3>
              <p className="text-zinc-400 text-base leading-relaxed relative z-10 font-medium">{desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Footer ── */}
      <footer className="relative pt-24 pb-12 px-6 border-t border-white/5 flex flex-col items-center gap-10 bg-black/40 backdrop-blur-3xl z-10 mt-auto">
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-center text-white">
          Ready to experience clarity?
        </h2>
        <Link href="/signup">
          <button className="px-10 py-4 text-sm uppercase tracking-widest font-bold rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-all">
            Join the Engine
          </button>
        </Link>
        <p className="text-zinc-600 text-sm font-medium mt-12 bg-black/50 px-6 py-2 rounded-full border border-white/5">
          © {new Date().getFullYear()} DeadlineOS · Crafted with Framer Motion.
        </p>
      </footer>
    </main>
  );
}
