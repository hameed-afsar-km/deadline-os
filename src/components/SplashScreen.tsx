'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_LINES = [
  'Initializing kernel modules...',
  'Loading priority engine...',
  'Connecting to sync layer...',
  'Mounting workspace filesystem...',
  'Authenticating session credentials...',
  'All systems nominal. Entering workspace.',
];

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [visible, setVisible]   = useState(true);
  const [lines,   setLines]     = useState<string[]>([]);
  const [barPct,  setBarPct]    = useState(0);
  const [exiting, setExiting]   = useState(false);

  useEffect(() => {
    let idx = 0;
    const step = () => {
      if (idx < BOOT_LINES.length) {
        setLines(prev => [...prev, BOOT_LINES[idx]]);
        setBarPct(Math.round(((idx + 1) / BOOT_LINES.length) * 100));
        idx++;
        setTimeout(step, 320 + Math.random() * 180);
      } else {
        // hold briefly then exit
        setTimeout(() => {
          setExiting(true);
          setTimeout(() => {
            setVisible(false);
            onDone();
          }, 700);
        }, 500);
      }
    };
    const t = setTimeout(step, 200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030303] overflow-hidden"
        >
          {/* Radial ambient glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)' }} />
          </div>

          {/* Central content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center gap-10 px-6 w-full max-w-lg"
          >
            {/* Logo Block */}
            <div className="flex flex-col items-center gap-4 text-center">
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white drop-shadow-[0_0_40px_rgba(99,102,241,0.6)]">
                Deadline<span className="text-indigo-400">OS</span>
              </h1>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.4em] mt-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full shadow-inner backdrop-blur-md">
                System Initialization
              </p>
            </div>

            {/* Boot terminal */}
            <div className="w-full rounded-[20px] border border-white/[0.06] bg-white/[0.02] p-6 font-mono min-h-[180px] space-y-2 overflow-hidden">
              {/* Terminal header row */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-rose-500/70" />
                <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                <span className="ml-3 text-[10px] text-zinc-600 uppercase tracking-widest">deadline-os — boot</span>
              </div>

              <AnimatePresence mode="popLayout">
                {lines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-start gap-3 text-[12px]"
                  >
                    <span className="text-indigo-500 shrink-0 select-none">{'>'}</span>
                    <span className={i === lines.length - 1 && barPct === 100 ? 'text-emerald-400' : 'text-zinc-400'}>
                      {line}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Blinking cursor */}
              {barPct < 100 && (
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-indigo-500 text-[12px]">{'>'}</span>
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-2 h-[14px] bg-indigo-400 inline-block"
                  />
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                <span>Boot Sequence</span>
                <span className="text-indigo-400 tabular-nums">{barPct}%</span>
              </div>
              <div className="h-1 w-full bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6)' }}
                  animate={{ width: `${barPct}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>

          {/* Corner deco */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <p className="text-[10px] text-zinc-700 font-mono uppercase tracking-[0.4em]">
              Deadline Management System
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
