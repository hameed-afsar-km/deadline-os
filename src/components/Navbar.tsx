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
  const [focused,  setFocused] = useState(false);
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
  const name    = user?.displayName ?? user?.email?.split('@')[0] ?? 'user';

  return (
    <header className="sticky top-0 z-50 h-20 px-6 lg:px-12 flex items-center justify-between border-b border-white/5 backdrop-blur-2xl"
      style={{ background: 'rgba(2, 6, 23, 0.4)' }}>

      {/* Left */}
      <div className="flex items-center gap-4">
        <motion.button onClick={onMenuToggle} whileTap={{ scale:.9 }}
          className="md:hidden p-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </motion.button>
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale:1.05, rotate:5 }} className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-lg bg-violet-600 shadow-[0_0_20px_rgba(139,92,246,0.6)]">
            D
          </motion.div>
          <span className="font-black hidden md:block text-xl tracking-tighter">Deadline<span className="text-violet-500">OS</span></span>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-lg hidden sm:block">
        <div className="relative group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-all group-focus-within:text-violet-500 text-slate-500" />
          <input type="search" value={local} onChange={onChange}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            placeholder="SYSTEM_SEARCH_ALL..."
            className="w-full pl-11 pr-5 py-3.5 text-xs font-black tracking-widest uppercase bg-white/5 border border-white/10 rounded-2xl focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all placeholder:text-slate-600" />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <motion.button whileHover={{ scale:1.06 }} whileTap={{ scale:.9 }}
          className="relative p-3 rounded-xl border border-white/5 bg-white/[0.03] text-slate-400 hover:text-white transition-all">
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-violet-500 border-2 border-[#020617] animate-pulse" />
        </motion.button>

        {/* User menu */}
        <div ref={menuRef} className="relative ml-2">
          <motion.button onClick={() => setMenuOpen(s => !s)} whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }}
            className="flex items-center gap-3 p-1.5 pl-1.5 pr-4 rounded-2xl border border-white/5 bg-white/[0.04] transition-all">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black bg-gradient-to-br from-violet-600 to-fuchsia-600">
              {initial}
            </div>
            <div className="flex flex-col items-start leading-tight hidden lg:flex">
              <span className="text-xs font-black tracking-tight">{name}</span>
              <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">NODE_ACTIVE</span>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-300 ml-1 text-slate-500 ${menuOpen?'rotate-180':''}`} />
          </motion.button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div initial={{ opacity:0, y:12, scale:.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:8, scale:.96 }}
                className="absolute right-0 top-[calc(100%+8px)] w-60 rounded-2xl overflow-hidden border border-white/5 bg-slate-900/90 backdrop-blur-2xl shadow-2xl">
                <div className="px-5 py-5 border-b border-white/5 flex flex-col gap-1">
                  <p className="text-sm font-black leading-none">{user?.displayName}</p>
                  <p className="text-[10px] truncate text-slate-500 font-mono tracking-tight">{user?.email}</p>
                </div>
                <div className="p-2.5">
                  <motion.button whileHover={{ backgroundColor:'rgba(244,63,94,0.1)' }}
                    onClick={async() => { await logOut(); toast.success('TERMINATED_SESSION'); router.replace('/login'); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black tracking-widest uppercase rounded-xl transition-all text-rose-500">
                    <LogOut size={16} /> SIGN_OUT
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
