'use client';

import { logOut } from '@/lib/auth';
import { useUserStore } from '@/store/useUserStore';
import { useEventStore } from '@/store/useEventStore';
import { Bell, LogOut, Search, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebouncedCallback } from 'use-debounce';

interface NavbarProps { onMenuToggle?: () => void; sidebarOpen?: boolean; }

export function Navbar({ onMenuToggle, sidebarOpen }: NavbarProps) {
  const router = useRouter();
  const { user } = useUserStore();
  const { setSearchQuery } = useEventStore();
  const [local, setLocal]         = useState('');
  const [focused, setFocused]     = useState(false);
  const [showMenu, setShowMenu]   = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const debSearch = useDebouncedCallback((v: string) => setSearchQuery(v), 300);
  const onChange  = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setLocal(e.target.value); debSearch(e.target.value); }, [debSearch]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const avatar = user?.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U';
  const name   = user?.displayName ?? user?.email?.split('@')[0] ?? 'there';

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-5 md:px-8 h-16 border-b transition-all"
      style={{ borderColor: 'var(--b1)', background: 'rgba(12,10,9,0.9)', backdropFilter: 'blur(20px)' }}
    >
      <div className="flex items-center gap-4">
        <motion.button
          onClick={onMenuToggle}
          whileTap={{ scale: 0.88 }}
          className="md:hidden p-2 rounded-xl transition-colors"
          style={{ color: 'var(--t2)' }}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </motion.button>
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #B45309)', color: '#0C0A09' }}
          >
            D
          </motion.div>
          <span className="text-sm font-bold tracking-tight hidden sm:block" style={{ color: 'var(--t0)' }}>DeadlineOS</span>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-sm mx-4 md:mx-8">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
            style={{ color: focused ? 'var(--amber)' : 'var(--t3)' }} />
          <input
            type="text"
            value={local}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search your deadlines..."
            className="field w-full pl-9 pr-4 py-2.5"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.88 }}
          className="relative p-2.5 rounded-xl transition-colors"
          style={{ color: 'var(--t2)', background: 'var(--s2)' }}
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'var(--amber)' }} />
        </motion.button>

        <div ref={menuRef} className="relative">
          <motion.button
            onClick={() => setShowMenu(s => !s)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
            style={{ background: 'var(--s2)', border: '1px solid var(--b1)' }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #B45309)', color: '#0C0A09' }}
            >
              {avatar}
            </div>
            <span className="text-sm font-semibold hidden sm:block" style={{ color: 'var(--t1)' }}>
              {name.split(' ')[0]}
            </span>
          </motion.button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] as any }}
                className="absolute right-0 top-[calc(100%+8px)] w-60 rounded-2xl overflow-hidden"
                style={{ background: 'var(--s2)', border: '1px solid var(--b2)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
              >
                <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--b1)' }}>
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--t0)' }}>{user?.displayName}</p>
                  <p className="text-xs font-medium truncate mt-0.5" style={{ color: 'var(--t3)' }}>{user?.email}</p>
                </div>
                <div className="p-2">
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(251,113,133,0.08)' }}
                    onClick={async () => { await logOut(); toast.success('Signed out.'); router.replace('/login'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold rounded-xl transition-colors"
                    style={{ color: 'var(--rose)' }}
                  >
                    <LogOut size={15} /> Sign out
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
