'use client';

import { logOut } from '@/lib/auth';
import { useUserStore } from '@/store/useUserStore';
import { useEventStore } from '@/store/useEventStore';
import { Bell, LogOut, Search, PanelLeft, X, ChevronDown, Sparkles, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebouncedCallback } from 'use-debounce';
import { cn } from '@/utils/cn';

interface NavbarProps {
  onMenuToggle?: () => void;
  sidebarOpen?: boolean;
}

export function Navbar({ onMenuToggle, sidebarOpen }: NavbarProps) {
  const router = useRouter();
  const { user } = useUserStore();
  const { setSearchQuery } = useEventStore();
  const [localQ, setLocalQ] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const debounced = useDebouncedCallback((v: string) => setSearchQuery(v), 280);
  const onChange   = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQ(e.target.value);
    debounced(e.target.value);
  }, [debounced]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initial = user?.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <header className="w-full max-w-[1400px] mx-auto h-[68px] glass-hi border border-white/10 rounded-[24px] shadow-2xl backdrop-blur-3xl px-6 flex items-center justify-between relative z-50">
        
        {/* Subtle accent glow behind the island */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
      
        <div className="flex items-center gap-6">
          {/* Sidebar toggle */}
          <button onClick={onMenuToggle}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-all md:hidden hover:scale-[1.05] active:scale-[0.95]">
            {sidebarOpen ? <X size={20} /> : <PanelLeft size={20} />}
          </button>

          {/* Brand & Landing Access */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 select-none group focus:outline-none">
              <span className="font-black text-xl text-white tracking-tighter group-hover:text-indigo-400 transition-colors">DeadlineOS</span>
            </Link>
                      </div>
        </div>

        {/* Search Container - Expanded & Centered */}
        <div className="flex-1 max-w-xl hidden md:block mx-10">
          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors pointer-events-none" />
            <input
              value={localQ}
              onChange={onChange}
              placeholder="Query workspace..."
              className="w-full bg-white/[0.03] border border-white/[0.06] focus:border-indigo-500/50 focus:bg-white/[0.05] outline-none h-10 pl-11 pr-4 text-sm text-white placeholder:text-zinc-600 rounded-xl transition-all shadow-inner"
            />
            {localQ && (
              <button onClick={() => { setLocalQ(''); setSearchQuery(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 ml-auto px-1">
          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button 
              onClick={() => setNotifOpen(!notifOpen)}
              className={cn(
                "relative w-10 h-10 rounded-xl border flex items-center justify-center transition-all hover:scale-[1.05] active:scale-[0.95]",
                notifOpen ? "bg-white text-black border-transparent" : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
              )}
            >
              <Bell size={18} />
              <span className={cn("absolute top-3 right-3 w-2 h-2 rounded-full ring-2 ring-[#000000]", notifOpen ? "bg-black" : "bg-indigo-500")} />
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-[calc(100%+12px)] w-80 bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl z-[999] p-1"
                >
                  <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-white uppercase tracking-widest px-1">Alerts</span>
                    <span className="text-[10px] text-zinc-500 font-medium">Clear All</span>
                  </div>
                  <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto no-sb text-center py-10 opacity-60">
                     <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 mx-auto mb-3 flex items-center justify-center text-zinc-600">
                       <Bell size={18} />
                     </div>
                     <p className="text-xs text-zinc-500 px-6">Transmission channels clear. No new signals detected.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* User Info */}
        <div ref={menuRef} className="relative">
          <motion.button
            onClick={() => setMenuOpen(s => !s)}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 pl-2 pr-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all shadow-sm group"
          >
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-black text-xs font-bold shrink-0 transition-transform group-hover:scale-110">
              {initial}
            </div>
            <div className="hidden sm:flex flex-col items-start pr-1">
              <span className="text-xs font-bold text-white max-w-[100px] truncate leading-tight">
                {user?.displayName || 'Workspace Adm'}
              </span>
              <span className="text-[10px] text-zinc-500 font-medium">Productivity Lead</span>
            </div>
            <ChevronDown size={14} className={`text-zinc-500 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-[calc(100%+12px)] w-64 bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[999] p-1.5"
              >
                <div className="px-4 py-4 border-b border-white/5 bg-white/[0.02] rounded-t-[20px] mb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white text-sm font-bold shrink-0">{initial}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate leading-tight">{user?.displayName || 'User'}</p>
                      <p className="text-[11px] text-zinc-500 truncate mt-1">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="p-1 space-y-1">
                  <button
                    onClick={async () => {
                      try {
                        await logOut();
                        toast.success('Successfully Signed Out');
                        router.replace('/login');
                      } catch (err: any) {
                        console.error('Sign Out Fail:', err);
                        toast.error('Sign out failed. Please try again.');
                      }
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors group"
                  >
                    <span>Sign Out</span> <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
  );
}
