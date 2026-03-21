'use client';

import { logOut } from '@/lib/auth';
import { useUserStore } from '@/store/useUserStore';
import { useEventStore } from '@/store/useEventStore';
import { Bell, LogOut, Search, PanelLeft, X, ChevronDown, User2 } from 'lucide-react';
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
    <header className="sticky top-0 z-50 h-[64px] glass border-b border-white/5 flex items-center px-4 md:px-8 gap-4">
      
      {/* Sidebar toggle */}
      <button onClick={onMenuToggle}
        className="flex-shrink-0 w-9 h-9 rounded-xl glass-hi border border-white/[0.07] flex items-center justify-center text-[--c-muted] hover:text-white transition-colors md:hidden">
        {sidebarOpen ? <X size={18} /> : <PanelLeft size={18} />}
      </button>

      {/* Logo (narrow screens) */}
      <span className="font-bold text-[0.95rem] text-white md:hidden tracking-tight">DeadlineOS</span>

      {/* Search */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative group">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-500 transition-colors pointer-events-none" />
          <input
            value={localQ}
            onChange={onChange}
            placeholder="SYSTEM_SEARCH_PROTOCOL..."
            className="inp pl-10 h-10 text-[0.75rem] rounded-xl font-mono tracking-wider"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Bell */}
        <button className="relative w-9 h-9 rounded-xl glass border border-white/[0.05] flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
          <Bell size={16} />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-cyan-500 glow-accent" />
        </button>

        {/* Avatar dropdown */}
        <div ref={menuRef} className="relative">
          <motion.button
            onClick={() => setMenuOpen(s => !s)}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl glass border border-white/[0.05] hover:border-white/20 transition-all shadow-lg shadow-cyan-500/5"
          >
            <div className="w-7 h-7 rounded-lg grad-accent flex items-center justify-center text-white text-[10px] font-black shrink-0 glow-accent">
              {initial}
            </div>
            <span className="text-[11px] font-black text-white hidden sm:block max-w-[120px] truncate uppercase tracking-widest">
              {user?.displayName || user?.email?.split('@')[0] || 'User'}
            </span>
            <ChevronDown size={12} className={`text-zinc-500 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 top-[calc(100%+12px)] w-64 glass-hi hud-border rounded-xl shadow-[0_30px_90px_rgba(0,0,0,0.8)] overflow-hidden z-50 p-1"
              >
                {/* Profile section */}
                <div className="px-4 py-4 border-b border-white/[0.05] mb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg grad-accent flex items-center justify-center text-white text-xs font-black shrink-0 glow-accent">{initial}</div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black text-white truncate uppercase tracking-tighter">{user?.displayName || 'OPERATOR'}</p>
                      <p className="text-[9px] text-zinc-500 truncate font-mono">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={async () => { await logOut(); toast.success('Signed out'); router.replace('/login'); }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-[10px] font-black text-rose-500 hover:bg-rose-500/10 transition-colors uppercase tracking-[0.2em]"
                >
                  Terminate Session <LogOut size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
