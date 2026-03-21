'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_LINES = [
  'Initializing workspace context...',
  'Syncing secure channels...',
  'Mounting priority engine...',
  'Verifying user session...',
  'Ready.',
];

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [visible, setVisible]   = useState(true);
  const [lines,   setLines]     = useState<string[]>([]);
  const [barPct,  setBarPct]    = useState(0);

  useEffect(() => {
    let idx = 0;
    const step = () => {
      if (idx < BOOT_LINES.length) {
        setLines(prev => [...prev, BOOT_LINES[idx]]);
        setBarPct(Math.round(((idx + 1) / BOOT_LINES.length) * 100));
        idx++;
        setTimeout(step, 200 + Math.random() * 200);
      } else {
        setTimeout(() => {
          setVisible(false);
          setTimeout(onDone, 600);
        }, 400);
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
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#000000] overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-10 w-full max-w-sm px-6"
          >
            {/* Minimal Logo */}
            <div className="flex flex-col items-center gap-5 text-center">
              <div className="w-16 h-16 rounded-[22px] bg-gradient-to-b from-white/20 to-transparent p-[1px]">
                 <div className="w-full h-full rounded-[21px] bg-[#0A0A0A] flex items-center justify-center shadow-inner">
                    <span className="text-white font-medium text-xl tracking-widest mt-0.5">DOS</span>
                 </div>
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">DeadlineOS</h1>
                <p className="text-[13px] text-zinc-500 mt-1">Workspace initialized</p>
              </div>
            </div>

            {/* Clean Progress & Logs */}
            <div className="w-full space-y-6">
              <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
                <span>{barPct === 100 ? 'System Ready' : 'Loading Assets...'}</span>
                <span className="text-white">{barPct}%</span>
              </div>
              
              <div className="h-[2px] w-full bg-white/[0.08] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white"
                  animate={{ width: `${barPct}%` }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                />
              </div>

              <div className="h-[80px] overflow-hidden flex flex-col justify-end text-[11px] font-mono text-zinc-600 gap-1.5 opacity-60">
                <AnimatePresence mode="popLayout">
                  {lines.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3"
                    >
                      <span>{line}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
