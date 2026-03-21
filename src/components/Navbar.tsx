'use client';

import { logOut } from '@/lib/auth';
import { useUserStore } from '@/store/useUserStore';
import { useEventStore } from '@/store/useEventStore';
import { Bell, LogOut, Search, PanelLeft, X, ChevronDown, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebouncedCallback } from 'use-debounce';

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
  const menuRef = useRef<HTMLDivElement>(null);

  const debounced = useDebouncedCallback((v: string) => setSearchQuery(v), 280);
  const onChange   = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQ(e.target.value);
    debounced(e.target.value);
  }, [debounced]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initial = user?.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <header className="sticky top-0 z-50 h-[72px] glass border-b border-white/[0.05] flex items-center px-6 md:px-10 gap-6 backdrop-blur-2xl">
      
      {/* Sidebar toggle */}
      <button onClick={onMenuToggle}
        className="flex-shrink-0 w-10 h-10 rounded-2xl glass-hi border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white transition-all md:hidden hover:scale-[1.05] active:scale-[0.95]">
        {sidebarOpen ? <X size={20} /> : <PanelLeft size={20} />}
      </button>

      {/* Logo */}
      <div className="flex items-center gap-3 select-none">
        <div className="w-10 h-10 rounded-xl grad-accent flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
          D
        </div>
        <span className="font-bold text-lg text-white hidden md:block tracking-tight">DeadlineOS</span>
      </div>

      {/* Search Container */}
      <div className="flex-1 max-w-lg hidden md:block mx-10">
        <div className="relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors pointer-events-none" />
          <input
            value={localQ}
            onChange={onChange}
            placeholder="Search within your workspace..."
            className="inp pl-12 h-11 text-sm bg-white/[0.02] border-white/5 shadow-inner rounded-2xl"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {/* Notifications */}
        <button className="relative w-10 h-10 rounded-2xl glass border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-all hover:scale-[1.05] active:scale-[0.95]">
          <Bell size={18} />
          <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-[#030303]" />
        </button>

        {/* User Info */}
        <div ref={menuRef} className="relative">
          <motion.button
            onClick={() => setMenuOpen(s => !s)}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 pl-2 pr-2.5 py-1.5 rounded-2xl glass border border-white/5 hover:border-white/10 transition-all shadow-xl shadow-indigo-500/5 group"
          >
            <div className="w-8 h-8 rounded-xl grad-accent flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-110">
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
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 top-[calc(100%+12px)] w-64 glass-hi rounded-[24px] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden z-50 p-2"
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
                    onClick={async () => { await logOut(); toast.success('Cleared Session'); router.replace('/login'); }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors group"
                  >
                    <span>Sign Out</span> <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
