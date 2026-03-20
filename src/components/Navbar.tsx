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
  const name    = user?.displayName ?? user?.email?.split('@')[0] ?? 'User';

  return (
    <header className="sticky top-0 z-50 h-[72px] px-6 lg:px-8 flex items-center justify-between glass-header">

      {/* Left */}
      <div className="flex items-center gap-4">
        <motion.button onClick={onMenuToggle} whileTap={{ scale:.95 }}
          className="md:hidden p-2 rounded-md hover:bg-slate-100 text-slate-500 transition-colors">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </motion.button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm bg-blue-600 shadow-sm">
            D
          </div>
          <span className="font-bold hidden md:block text-lg tracking-tight text-slate-900">DeadlineOS</span>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md hidden sm:block mx-8">
        <div className="relative group">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          <input type="search" value={local} onChange={onChange}
            placeholder="Search tasks, categories..."
            className="w-full pl-10 pr-4 py-2.5 text-sm font-medium bg-slate-100 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-500" />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }}
          className="relative p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all">
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-blue-500 border-2 border-white" />
        </motion.button>

        {/* User menu */}
        <div ref={menuRef} className="relative">
          <motion.button onClick={() => setMenuOpen(s => !s)} whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-colors border border-transparent">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-blue-700 bg-blue-50 border border-blue-100 font-bold text-sm">
              {initial}
            </div>
            <div className="flex flex-col items-start leading-tight hidden lg:flex">
              <span className="text-sm font-semibold text-slate-900">{name}</span>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-200 ml-1 text-slate-400 ${menuOpen?'rotate-180':''}`} />
          </motion.button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div initial={{ opacity:0, y:8, scale:.98 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:4, scale:.98 }} transition={{ duration: 0.15 }}
                className="absolute right-0 top-[calc(100%+8px)] w-64 rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden py-2"
                style={{ transformOrigin: 'top right' }}>
                <div className="px-5 py-3 border-b border-slate-100 mb-2">
                  <p className="text-sm font-bold text-slate-900">{user?.displayName || 'User'}</p>
                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{user?.email}</p>
                </div>
                <div className="px-2">
                  <button onClick={async() => { await logOut(); toast.success('Signed out successfully'); router.replace('/login'); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors text-red-600 hover:bg-red-50">
                    <LogOut size={16} /> Sign out
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
