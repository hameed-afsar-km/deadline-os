'use client';

import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin, Heart, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative w-full border-t border-white/5 py-12 px-10 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute -bottom-20 -left-20 w-[60%] h-[120%] rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle, #6366F1 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 -right-20 w-[40%] h-[100%] rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle, #A855F7 0%, transparent 60%)' }} />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h2 className="text-xl font-black text-white tracking-tighter mb-2">DeadlineOS</h2>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">
            The modern workspace protocol for high-performance individuals.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">All Systems Online</span>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366F1] animate-pulse" />
          </div>
          
          <p className="hidden md:block text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
            © 2026 Powered by DeepMind
          </p>
        </div>
      </div>
    </footer>
  );
}
