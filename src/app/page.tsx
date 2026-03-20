'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, BarChart2, CheckCircle2 } from 'lucide-react';

const FEATURES = [
  { icon: Zap,       label: 'Intelligent Sorting', desc: 'Automatically re-prioritize your critical tasks as deadlines approach.' },
  { icon: BarChart2, label: 'Visual Productivity', desc: 'Track your completion metrics through crystal-clear data visualization.' },
  { icon: Shield,    label: 'Enterprise Security', desc: 'Your data is securely stored and synced across all your devices instantly.' },
];

export default function HomePage() {
  const { user, loading } = useUserStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { const timer = setTimeout(() => setMounted(true), 0); return () => clearTimeout(timer); }, []);
  useEffect(() => { if (!loading && user) router.replace('/dashboard'); }, [user, loading, router]);

  if (!mounted) return null;

  return (
    <main className="flex flex-col min-h-screen relative overflow-hidden bg-slate-50 text-slate-900 font-sans">
      
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 h-20 flex items-center justify-between px-6 lg:px-[10%] bg-white/70 backdrop-blur-xl border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-lg bg-blue-600 shadow-sm">
            D
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">DeadlineOS</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/login">
            <button className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Sign in</button>
          </Link>
          <Link href="/signup">
            <button className="px-5 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all focus:ring-4 focus:ring-blue-500/20">
              Get Started
            </button>
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 px-6 lg:px-[10%] flex flex-col items-center text-center gap-8 max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold tracking-wide"
        >
          Announcing Version 4.0
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight"
        >
          Manage your deadlines with <br/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">absolute clarity.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-2xl text-lg lg:text-xl text-slate-600 leading-relaxed font-medium mx-auto"
        >
          A unified, high-performance platform for professionals who need to stay ahead of complex timelines and critical business objectives.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-4"
        >
          <Link href="/signup">
            <button className="px-8 py-4 text-base font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2">
              Start Building Free <ArrowRight size={18} />
            </button>
          </Link>
          <div className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-slate-600 text-sm font-medium bg-white border border-slate-200 shadow-sm">
            <CheckCircle2 size={18} className="text-emerald-500" />
            No credit card required
          </div>
        </motion.div>
      </section>

      {/* ── Features Grid ── */}
      <section className="px-6 lg:px-[10%] pb-32 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon:Icon, label, desc }, i) => (
            <motion.div 
              key={label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all card-hover cursor-default"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-blue-50 text-blue-600 border border-blue-100">
                <Icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">{label}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Stats Band ── */}
      <section className="border-y border-slate-200 py-16 px-6 lg:px-[10%] bg-white w-full">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-12">
          {[{ n: '12,000+', l: 'Organizations' }, { n: '98.5%', l: 'Satisfaction Rate' }, { n: '99.9%', l: 'Cloud Uptime' }].map(({ n, l }) => (
            <div key={l} className="flex flex-col items-center md:items-start text-center md:text-left mx-auto md:mx-0">
              <span className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">{n}</span>
              <span className="text-sm font-semibold text-slate-500 mt-2 uppercase tracking-wide">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="pt-24 pb-12 px-6 lg:px-[10%] bg-slate-50 flex flex-col items-center gap-10">
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-center text-slate-900">
          Ready to streamline your workflow?
        </h2>
        <Link href="/signup">
          <button className="px-10 py-4 text-base font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all">
            Create your workspace
          </button>
        </Link>
        <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase mt-8">
          © {new Date().getFullYear()} DeadlineOS Inc. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
