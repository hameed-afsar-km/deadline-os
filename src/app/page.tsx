'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Calendar, Bell, Zap, CheckCircle2, Shield, Layers, ChevronRight } from 'lucide-react';

const WORDS = ['assignments', 'hackathons', 'exams', 'projects', 'submissions'];

const FEATURES = [
  {
    icon: Zap,
    title: 'Smart Priority',
    desc: 'Auto-calculates urgency based on time remaining to ensure you focus on what matters most.',
    color: '#f59e0b',
  },
  {
    icon: Bell,
    title: 'Intelligent Reminders',
    desc: 'Get notified before deadlines hit. Smart auto-scheduling keeps you ahead of the curve.',
    color: '#06b6d4',
  },
  {
    icon: Calendar,
    title: 'Visual Calendar',
    desc: 'Interactive monthly view with event indicators. Click any day to see your schedule.',
    color: '#8b5cf6',
  },
  {
    icon: CheckCircle2,
    title: 'Real-time Sync',
    desc: 'Firestore-powered synchronization. Change a deadline on your phone—it appears everywhere.',
    color: '#10b981',
  },
  {
    icon: Shield,
    title: 'Private & Secure',
    desc: 'Your data belongs to you. Industry-standard security rules protect every record.',
    color: '#f43f5e',
  },
  {
    icon: Layers,
    title: 'Multi-category',
    desc: 'Customizable tags for rapid organization and color-coded instant visual recognition.',
    color: '#6366f1',
  },
];

const STATS = [
  { value: '∞', label: 'Deadlines' },
  { value: '100%', label: 'Uptime' },
  { value: '0', label: 'Missed' },
];

export default function HomePage() {
  const { user, loading } = useUserStore();
  const router = useRouter();
  const [wordIdx, setWordIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  // Typewriter effect
  useEffect(() => {
    const word = WORDS[wordIdx];
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
    } else {
      setDeleting(false);
      setWordIdx((i) => (i + 1) % WORDS.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, wordIdx]);

  if (!mounted) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#050505] text-white relative overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full opacity-30 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #7c3aed, #4f46e5)' }}
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #ec4899, #f43f5e)' }}
        />
      </div>

      {/* Navbar */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-50 flex items-center justify-between px-6 py-5 lg:px-12 backdrop-blur-md border-b border-white/5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/20">
            <span className="font-black text-white text-lg">D</span>
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">DeadlineOS</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/signup" className="px-6 py-2.5 rounded-full text-sm font-bold bg-white text-black hover:bg-gray-100 transition-colors shadow-lg shadow-white/10">
              Get Started
            </Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-32 text-center">
        <motion.div
           style={{ y: yParallax, opacity: opacityFade }}
           className="flex flex-col items-center w-full max-w-5xl"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 mb-8 backdrop-blur-md"
          >
            <Zap size={14} className="text-purple-400" />
            <span className="text-xs font-semibold text-purple-200 tracking-wide uppercase">Meet your new command center</span>
          </motion.div>

          <motion.h1 
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 leading-[0.9]"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>Never miss</motion.div>
            <motion.div variants={itemVariants} className="bg-clip-text text-transparent bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400">
              another deadline.
            </motion.div>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="h-12 md:h-16 flex items-center justify-center text-xl md:text-3xl font-medium text-gray-400 mb-10"
          >
            Manage your <span className="text-white ml-2 font-semibold min-w-[150px] text-left inline-block">{displayed}<span className="animate-pulse border-r-2 border-white ml-1"></span></span>
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <Link href="/signup">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg flex items-center justify-center gap-2 overflow-hidden shadow-xl shadow-white/10"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                Start for free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Showcase */}
      <section className="relative z-20 py-32 px-6 border-t border-white/5 bg-black/50 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">Designed for <span className="text-purple-400">focus.</span></h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Everything you need to regain control over your time and prioritize like a pro.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all"
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-black/50"
                  style={{ backgroundColor: `${feat.color}20`, color: feat.color }}
                >
                  <feat.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern CTA */}
      <section className="relative z-20 py-32 px-6 flex items-center justify-center border-t border-white/5">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl w-full relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[3rem] blur-2xl opacity-30" />
          <div className="relative p-12 md:p-20 bg-black/80 backdrop-blur-xl border border-white/10 rounded-[3rem] text-center overflow-hidden">
            <h2 className="text-4xl md:text-6xl font-black mb-6">Your time is <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">valuable</span>.</h2>
            <p className="text-xl text-gray-300 mb-10 max-w-xl mx-auto">Join the new standard of deadline management. No credit card required.</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Link href="/signup" className="flex items-center gap-2 px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:shadow-xl hover:shadow-white/20 transition-all">
                Create free account <ChevronRight size={20} />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Clean Footer (Watermark Removed) */}
      <footer className="relative z-20 border-t border-white/5 py-8 px-6 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} DeadlineOS · All rights reserved.</p>
      </footer>

    </main>
  );
}
