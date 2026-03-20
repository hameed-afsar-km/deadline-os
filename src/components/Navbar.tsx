'use client';

import { logOut } from '@/lib/auth';
import { useUserStore } from '@/store/useUserStore';
import { useEventStore } from '@/store/useEventStore';
import { Bell, LogOut, Search, Menu, X, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebouncedCallback } from 'use-debounce';

interface NavbarProps { onMenuToggle?:()=>void; sidebarOpen?:boolean; }

export function Navbar({ onMenuToggle, sidebarOpen }: NavbarProps) {
  const router = useRouter();
  const { user } = useUserStore();
  const { setSearchQuery } = useEventStore();
  const [local,    setLocal]   = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const debounced = useDebouncedCallback((v:string) => setSearchQuery(v), 300);
  const onChange  = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setLocal(e.target.value); debounced(e.target.value); }, [debounced]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const initial = user?.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <header className="sticky top-0 z-50 h-[80px] px-6 lg:px-10 flex items-center justify-between bg-transparent border-b border-white/5 backdrop-blur-2xl">

      {/* Left */}
      <div className="flex items-center gap-6">
        <motion.button onClick={onMenuToggle} whileTap={{ scale:.9 }}
          className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white transition-colors">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </motion.button>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            D
          </div>
          <span className="font-extrabold hidden md:block text-xl tracking-tight text-white drop-shadow-lg">DeadlineOS</span>
        </div>
      </div>

      {/* Search Bar - Center */}
      <div className="flex-1 max-w-xl hidden sm:block mx-8 relative z-10">
        <div className="relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
          <input type="search" value={local} onChange={onChange}
            placeholder="Search objectives, files, categories..."
            className="w-full pl-12 pr-4 py-3 text-sm font-medium bg-white/[0.03] border border-white/10 rounded-2xl focus:bg-white/[0.08] focus:border-cyan-500/50 outline-none transition-all placeholder:text-zinc-600 text-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)]" />
        </div>
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-5">
        <motion.button whileHover={{ scale:1.1, backgroundColor:'rgba(255,255,255,0.1)' }} whileTap={{ scale:.9 }}
          className="relative w-10 h-10 flex items-center justify-center rounded-full text-zinc-400 hover:text-white glass-panel transition-all">
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] border border-black/50" />
        </motion.button>

        {/* User menu dropdown */}
        <div ref={menuRef} className="relative z-50">
          <motion.button onClick={() => setMenuOpen(s => !s)} whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }}
            className="flex items-center gap-2 p-1.5 pr-2 rounded-full glass-panel hover:bg-white/[0.15] transition-all border border-white/10 shadow-lg">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-gradient-to-tr from-cyan-600 to-indigo-600 font-bold text-sm shadow-inner">
              {initial}
            </div>
            <ChevronDown size={14} className={`transition-transform duration-300 ml-1 text-zinc-400 ${menuOpen?'rotate-180 text-white':''}`} />
          </motion.button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div initial={{ opacity:0, y:12, scale:.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:8, scale:.95 }} transition={{ duration: 0.2, type: 'spring', bounce: 0.3 }}
                className="absolute right-0 top-[calc(100%+12px)] w-64 rounded-3xl glass-panel overflow-hidden py-2"
                style={{ transformOrigin: 'top right' }}>
                <div className="px-5 py-4 border-b border-white/10 mb-2 bg-white/5">
                  <p className="text-sm font-bold text-white tracking-tight">{user?.displayName || 'User'}</p>
                  <p className="text-xs text-zinc-400 font-medium truncate mt-1">{user?.email}</p>
                </div>
                <div className="px-3 pb-2">
                  <button onClick={async() => { await logOut(); toast.success('Signed out'); router.replace('/login'); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-2xl transition-all text-red-400 hover:bg-red-500/10 hover:text-red-300">
                    <LogOut size={18} /> Sign out
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
