'use client';

import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin, Heart, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative w-full border-t border-white/5 py-12 px-10 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute -bottom-20 -left-20 w-[60%] h-[120%] bg-indigo-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 -right-20 w-[40%] h-[100%] bg-purple-500/10 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-black text-white tracking-tighter mb-4">DeadlineOS</h2>
            <p className="text-zinc-500 max-w-sm font-medium leading-relaxed">
              The modern workspace protocol for high-performance individuals. Engineered for clarity, efficiency, and aesthetic excellence.
            </p>
          </div>
          
          <div>
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-6">Social Nodes</h3>
            <div className="space-y-4">
              {[
                 { label: 'GitHub',    icon: Github,   href: '#' },
                 { label: 'Twitter',   icon: Twitter,  href: '#' },
                 { label: 'LinkedIn',  icon: Linkedin, href: '#' },
              ].map(({ label, icon: Icon, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  whileHover={{ x: 4, color: '#6366F1' }}
                  className="flex items-center gap-3 text-zinc-500 text-sm font-bold transition-all"
                >
                  <Icon size={18} />
                  {label}
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-6">Resources</h3>
            <div className="space-y-4">
              {['Documentation', 'Security', 'Privacy', 'Status'].map((item) => (
                <motion.a
                  key={item}
                  href="#"
                  whileHover={{ x: 4, color: '#fff' }}
                  className="block text-zinc-500 text-sm font-bold transition-all"
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 gap-6 text-center md:text-left">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
            © 2026 DeadlineOS <span className="text-zinc-700">|</span> 
            <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-default">
              Made with <Heart size={14} className="text-rose-500 fill-rose-500" /> by DeepMind
            </span>
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Build 2026.03.21-R1</span>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366F1]" />
          </div>
        </div>
      </div>
    </footer>
  );
}
