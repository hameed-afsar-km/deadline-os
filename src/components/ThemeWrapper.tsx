'use client';

import { motion } from 'framer-motion';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex flex-col font-sans bg-[#050505] overflow-hidden text-zinc-100">
      
      {/* ── Animated Aurora Background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Soft Indigo / Violet Glow */}
        <motion.div
          animate={{ x: [0, 40, -20, 0], y: [0, -40, 30, 0], scale: [1, 1.1, 0.9, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full opacity-40 mix-blend-screen mix-blend-plus-lighter"
          style={{
            background: 'radial-gradient(circle at center, rgba(79, 70, 229, 0.35) 0%, transparent 60%)',
            filter: 'blur(80px)'
          }}
        />
        
        {/* Emerald / Cyan Glow */}
        <motion.div
          animate={{ x: [0, -30, 40, 0], y: [0, 50, -20, 0], scale: [1, 0.9, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[20%] -right-[10%] w-[50%] h-[70%] rounded-full opacity-30 mix-blend-screen mix-blend-plus-lighter"
          style={{
            background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.3) 0%, transparent 60%)',
            filter: 'blur(100px)'
          }}
        />

        {/* Deep Pink Glow */}
        <motion.div
          animate={{ x: [0, 30, -30, 0], y: [0, -20, 20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-[20%] left-[20%] w-[70%] h-[50%] rounded-full opacity-20 mix-blend-screen mix-blend-plus-lighter"
          style={{
            background: 'radial-gradient(circle at center, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
            filter: 'blur(120px)'
          }}
        />
      </div>

      {/* ── Soft Grain / Noise Overlay ── */}
      <div 
        aria-hidden
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Subtle Dot Grid ── */}
      <div 
        aria-hidden
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.2]"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* ── Flowing Content ── */}
      <div className="relative z-10 flex-1 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
