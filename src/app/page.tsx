'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock, Zap, Shield, BarChart2 } from 'lucide-react';

const MARQUEE = [
  '✦ AUTO-PRIORITY ENGINE', '✦ LIVE COUNTDOWN SYNC', '✦ ZERO MISSED DEADLINES',
  '✦ REAL-TIME FIRESTORE', '✦ STUDENT-FIRST DESIGN', '✦ HACKATHON PROVEN',
  '✦ AUTO-PRIORITY ENGINE', '✦ LIVE COUNTDOWN SYNC', '✦ ZERO MISSED DEADLINES',
  '✦ REAL-TIME FIRESTORE', '✦ STUDENT-FIRST DESIGN', '✦ HACKATHON PROVEN',
];

const FEATURES = [
  { icon:Zap,       label:'Fluid Priority',  c:'var(--red)',   desc:'Tasks re-rank automatically as deadlines approach. Your most critical task is always at the top.' },
  { icon:Clock,     label:'Live Countdowns', c:'var(--amber)', desc:'Exact time remaining, ticking in real-time. Urgency is always visible, never hidden.' },
  { icon:Shield,    label:'Fort Knox Sync',  c:'var(--blue)',  desc:'Firestore-backed, real-time across every device. Your deadlines live where you do.' },
  { icon:BarChart2, label:'Momentum Track',  c:'var(--green)', desc:'Watch your completion velocity compound over time. Every done task builds momentum.' },
];

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:.12 } } };
const fadeUp  = { hidden:{opacity:0,y:32}, show:{opacity:1,y:0,transition:{duration:.65,ease:[.22,1,.36,1] as [number,number,number,number]}} };

export default function HomePage() {
  const { user, loading } = useUserStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (!loading && user) router.replace('/dashboard'); }, [user, loading, router]);

  if (!mounted) return null;

  return (
    <main className="flex flex-col min-h-screen">
      {/* ══ NAV ══════════════════════════════════════════ */}
      <motion.header initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.6 }}
        className="sticky top-0 z-50 border-b flex items-center justify-between px-6 md:px-16 h-14 bg-[#EDE8DE]/95 backdrop-blur-sm"
        style={{ borderColor:'var(--ink-5)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-sm flex items-center justify-center text-white font-bold text-sm"
            style={{ background:'var(--red)', boxShadow:'0 2px 0 rgba(100,10,0,0.4)' }}>D</div>
          <span className="font-bold tracking-tight text-[15px]" style={{ fontFamily:'var(--font-sans)', color:'var(--ink)' }}>DeadlineOS</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {['Features','How it works','Pricing'].map(t => (
            <span key={t} className="text-sm font-medium cursor-pointer hover:text-[var(--red)] transition-colors" style={{ color:'var(--ink-2)' }}>{t}</span>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <button className="btn-ink px-4 py-2 text-sm">Sign in</button>
          </Link>
          <Link href="/signup">
            <button className="btn-red px-5 py-2 text-sm">Get started →</button>
          </Link>
        </div>
      </motion.header>

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section className="relative pt-20 pb-12 px-6 md:px-16 overflow-hidden">
        {/* Parallax background typography */}
        <motion.p className="absolute top-4 left-1/2 -translate-x-1/2 text-[28vw] font-bold leading-none select-none pointer-events-none"
          aria-hidden style={{ fontFamily:'var(--font-serif)', color:'var(--ink-5)', opacity:.4, letterSpacing:'-0.04em' }}>
          OS
        </motion.p>

        <div className="max-w-[1200px] mx-auto relative z-10">
          {/* Label row */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.1 }}
            className="flex items-center gap-3 mb-10">
            <div className="h-px flex-1 max-w-[80px]" style={{ background:'var(--ink-4)' }} />
            <span className="text-[10px] font-bold uppercase tracking-[.3em]" style={{ fontFamily:'var(--font-mono)', color:'var(--ink-3)' }}>
              Est. 2024 — Deadline Intelligence
            </span>
          </motion.div>

          {/* 3-column editorial hero grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-end">
            {/* Left: headline */}
            <motion.div variants={stagger} initial="hidden" animate="show" className="md:col-span-7">
              <motion.h1 variants={fadeUp}
                className="text-[4rem] md:text-[6rem] lg:text-[7.5rem] font-normal leading-[.9] tracking-tight mb-8"
                style={{ fontFamily:'var(--font-serif)' }}>
                Dead&shy;line<br />
                <em style={{ color:'var(--red)', fontFamily:'var(--font-serif)' }}>Intelligence</em><br />
                Refined.
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg font-medium leading-relaxed mb-10 max-w-md" style={{ color:'var(--ink-2)' }}>
                An auto-priority engine that surfaces exactly what matters, exactly when you need to act. No lists. Pure signal.
              </motion.p>
              <motion.div variants={fadeUp} className="flex items-center gap-4 flex-wrap">
                <Link href="/signup">
                  <motion.button whileHover={{ y:-3, boxShadow:'0 6px 0 rgba(100,10,0,0.35), 0 10px 24px rgba(200,34,10,0.3)' }}
                    whileTap={{ y:1, boxShadow:'0 1px 0 rgba(100,10,0,0.4)' }}
                    className="btn-red px-8 py-4 text-base rounded-sm flex items-center gap-2.5 transition-all">
                    Start free — 30 seconds <ArrowRight size={18} />
                  </motion.button>
                </Link>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} style={{ color:'var(--green)' }} />
                  <span className="text-sm font-medium" style={{ color:'var(--ink-3)' }}>No credit card</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: mock "printed" card preview */}
            <motion.div initial={{ opacity:0, y:40, rotate:2 }} animate={{ opacity:1, y:0, rotate:0 }}
              transition={{ duration:.8, delay:.4, ease:[.22,1,.36,1] as any }}
              className="md:col-span-5 hidden md:block">
              <div className="paper-card p-8 relative" style={{ transform:'rotate(1deg)' }}>
                <div className="absolute top-0 left-0 w-full h-1" style={{ background:`linear-gradient(90deg, var(--red), transparent)` }} />
                <div className="flex items-start justify-between mb-4">
                  <span className="tag-ink">⚡ Hackathon</span>
                  <span className="stamp">CRITICAL</span>
                </div>
                <h3 className="text-xl font-normal mb-2" style={{ fontFamily:'var(--font-serif)' }}>Submit Final Prototype</h3>
                <p className="text-sm mb-6" style={{ color:'var(--ink-3)' }}>Include video demo, slide deck and repo link</p>
                <div className="h-1.5 rounded-sm overflow-hidden mb-3" style={{ background:'var(--ink-5)' }}>
                  <div className="h-full w-[78%] rounded-sm" style={{ background:`linear-gradient(90deg, var(--amber), var(--red))` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ fontFamily:'var(--font-mono)', color:'var(--red)' }}>4H 37M LEFT</span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-sm" style={{ background:'var(--paper-2)', border:'1px solid var(--ink-5)', color:'var(--ink-2)' }}>
                    <CheckCircle2 size={12} style={{ color:'var(--green)' }} /> Mark done
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ MARQUEE TAPE ══════════════════════════════════ */}
      <div className="py-4 border-y overflow-hidden" style={{ borderColor:'var(--ink-5)', background:'var(--ink)', color:'var(--bg)' }}>
        <div className="flex gap-12 marquee-anim whitespace-nowrap">
          {MARQUEE.map((t,i) => (
            <span key={i} className="text-[10px] font-black uppercase tracking-[.25em] shrink-0" style={{ fontFamily:'var(--font-mono)', color:'#C8B89A' }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ══ FEATURES ═════════════════════════════════════ */}
      <section className="px-6 md:px-16 py-24 max-w-[1200px] mx-auto w-full">
        <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:.6 }} className="mb-16">
          <p className="text-[10px] font-bold uppercase tracking-[.3em] mb-3" style={{ fontFamily:'var(--font-mono)', color:'var(--ink-3)' }}>§ 01 — Why it works</p>
          <h2 className="text-5xl md:text-7xl font-normal tracking-tight" style={{ fontFamily:'var(--font-serif)' }}>
            Built for<br /><em style={{ color:'var(--red)' }}>velocity.</em>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background:'var(--ink-5)' }}>
          {FEATURES.map(({ icon:Icon, label, c, desc }, i) => (
            <motion.div key={label}
              initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*.08, duration:.5 }}
              whileHover={{ backgroundColor:'var(--paper)' }}
              className="p-10 cursor-default transition-colors" style={{ background:'var(--paper-2)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-sm flex items-center justify-center" style={{ background:`${c}15`, border:`1px solid ${c}30` }}>
                  <Icon size={20} style={{ color:c }} />
                </div>
                <h3 className="text-2xl font-normal" style={{ fontFamily:'var(--font-serif)' }}>{label}</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color:'var(--ink-2)' }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ EDITORIAL NUMBERS ════════════════════════════ */}
      <section className="border-y" style={{ borderColor:'var(--ink-5)' }}>
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 divide-x" style={{ borderColor:'var(--ink-5)' }}>
          {[{n:'12K+',l:'Active users'},{n:'94%',l:'Fewer missed deadlines'},{n:'4.9',l:'Average rating'},{n:'Free',l:'Always'}].map(({ n, l }) => (
            <motion.div key={l} initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
              whileHover={{ backgroundColor:'var(--paper)' }}
              className="px-8 py-12 text-center transition-colors" style={{ background:'var(--paper-2)' }}>
              <p className="text-4xl md:text-6xl font-normal mb-2" style={{ fontFamily:'var(--font-serif)', color:'var(--red)' }}>{n}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ fontFamily:'var(--font-mono)', color:'var(--ink-3)' }}>{l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ CTA ══════════════════════════════════════════ */}
      <section className="px-6 md:px-16 py-28 max-w-[1200px] mx-auto w-full">
        <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          className="paper-card p-14 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background:`linear-gradient(90deg, var(--red), transparent)` }} />
          <p className="text-[10px] font-bold uppercase tracking-[.3em] mb-6" style={{ fontFamily:'var(--font-mono)', color:'var(--ink-3)' }}>§ 02 — Get started</p>
          <h2 className="text-5xl md:text-7xl font-normal tracking-tight mb-6" style={{ fontFamily:'var(--font-serif)' }}>
            Own your<br/><em style={{ color:'var(--red)' }}>deadlines.</em>
          </h2>
          <p className="text-lg mb-10" style={{ color:'var(--ink-2)' }}>Join thousands who never miss another deadline.</p>
          <Link href="/signup">
            <motion.button whileHover={{ y:-3, boxShadow:'0 6px 0 rgba(100,10,0,0.4), 0 12px 28px rgba(200,34,10,0.3)' }}
              whileTap={{ y:1 }}
              className="btn-red px-12 py-5 text-lg rounded-sm">
              Create free account →
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════ */}
      <footer className="border-t px-6 md:px-16 py-6 flex items-center justify-between" style={{ borderColor:'var(--ink-5)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-sm flex items-center justify-center text-xs font-bold text-white" style={{ background:'var(--red)' }}>D</div>
          <span className="font-bold text-sm" style={{ color:'var(--ink)' }}>DeadlineOS</span>
        </div>
        <p className="text-xs" style={{ fontFamily:'var(--font-mono)', color:'var(--ink-4)' }}>© {new Date().getFullYear()} — Built for closers.</p>
      </footer>
    </main>
  );
}
