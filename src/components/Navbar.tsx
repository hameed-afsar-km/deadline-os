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
    <header className="sticky top-0 z-50 border-b flex items-center justify-between px-4 md:px-6 h-14 gap-4"
      style={{ borderColor:'var(--ink-5)', background:'rgba(237,232,222,0.96)', backdropFilter:'blur(8px)' }}>

      {/* Left */}
      <div className="flex items-center gap-3">
        <motion.button onClick={onMenuToggle} whileTap={{ scale:.88 }}
          className="md:hidden p-2 rounded-sm" style={{ color:'var(--ink-2)' }}>
          {sidebarOpen ? <X size={19} /> : <Menu size={19} />}
        </motion.button>
        <div className="flex items-center gap-2.5">
          <motion.div whileHover={{ scale:1.05 }} className="w-8 h-8 rounded-sm flex items-center justify-center text-white font-bold text-sm"
            style={{ background:'var(--red)', boxShadow:'0 2px 0 rgba(100,10,0,0.4)' }}>
            D
          </motion.div>
          <span className="font-bold hidden sm:block text-[15px]" style={{ color:'var(--ink)' }}>DeadlineOS</span>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xs">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
            style={{ color: focused ? 'var(--red)' : 'var(--ink-4)' }} />
          <input type="search" value={local} onChange={onChange}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            placeholder="Search deadlines..."
            className="field-ink w-full pl-9 pr-4 py-2 text-sm" />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <motion.button whileHover={{ scale:1.06 }} whileTap={{ scale:.9 }}
          className="relative p-2 rounded-sm border" style={{ background:'var(--paper)', borderColor:'var(--ink-5)', color:'var(--ink-2)' }}>
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background:'var(--red)' }} />
        </motion.button>

        {/* User menu */}
        <div ref={menuRef} className="relative">
          <motion.button onClick={() => setMenuOpen(s => !s)} whileHover={{ scale:1.02 }} whileTap={{ scale:.96 }}
            className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-sm border" style={{ background:'var(--paper)', borderColor:'var(--ink-5)' }}>
            <div className="w-7 h-7 rounded-sm flex items-center justify-center text-white text-xs font-bold"
              style={{ background:'var(--red)' }}>{initial}</div>
            <span className="text-sm font-semibold hidden sm:block" style={{ color:'var(--ink)' }}>
              {name.split(' ')[0]}
            </span>
            <ChevronDown size={13} className={`transition-transform ${menuOpen?'rotate-180':''}`} style={{ color:'var(--ink-3)' }} />
          </motion.button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div initial={{ opacity:0, y:8, scale:.96 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:4, scale:.97 }}
                transition={{ duration:.18, ease:[.22,1,.36,1] as any }}
                className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-sm overflow-hidden"
                style={{ background:'var(--paper)', border:'1.5px solid var(--ink-5)', boxShadow:'0 12px 40px rgba(23,20,12,0.15)' }}>
                <div className="px-4 py-3.5 border-b" style={{ borderColor:'var(--ink-5)' }}>
                  <p className="text-sm font-semibold" style={{ color:'var(--ink)' }}>{user?.displayName}</p>
                  <p className="text-xs truncate" style={{ fontFamily:'var(--font-mono)', color:'var(--ink-3)' }}>{user?.email}</p>
                </div>
                <div className="p-2">
                  <motion.button whileHover={{ backgroundColor:'var(--red-l)' }}
                    onClick={async() => { await logOut(); toast.success('Signed out'); router.replace('/login'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold rounded-sm transition-colors"
                    style={{ color:'var(--red)' }}>
                    <LogOut size={14} /> Sign out
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
