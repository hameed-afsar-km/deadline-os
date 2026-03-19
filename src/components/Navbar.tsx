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

interface NavbarProps {
  onMenuToggle?: () => void;
  sidebarOpen?: boolean;
}

export function Navbar({ onMenuToggle, sidebarOpen }: NavbarProps) {
  const router = useRouter();
  const { user } = useUserStore();
  const { setSearchQuery } = useEventStore();
  const [localSearch, setLocalSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebouncedCallback((v: string) => setSearchQuery(v), 300);
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
    debouncedSearch(e.target.value);
  }, [debouncedSearch]);

  const handleLogout = async () => {
    await logOut();
    toast.success('Signed out.');
    router.replace('/login');
  };

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const avatar = user?.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U';
  const displayName = user?.displayName ?? user?.email?.split('@')[0] ?? 'User';

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-5 md:px-8 h-16 border-b-2"
      style={{ borderColor: 'var(--ink)', background: 'var(--paper)' }}
    >
      {/* Left */}
      <div className="flex items-center gap-5">
        <motion.button
          onClick={onMenuToggle}
          whileTap={{ scale: 0.88 }}
          className="md:hidden p-2 rounded-xl border-2 transition-colors"
          style={{ borderColor: 'var(--border)', background: 'var(--white)' }}
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </motion.button>

        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-white text-sm"
            style={{ background: 'var(--ink)' }}
          >
            D/
          </div>
          <span className="font-display font-black text-lg tracking-tight hidden sm:block" style={{ color: 'var(--ink)' }}>
            DeadlineOS
          </span>
        </div>
      </div>

      {/* Centre */}
      <div className="flex-1 max-w-sm mx-4 md:mx-8">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: searchFocused ? 'var(--accent)' : 'var(--ink-4)' }} />
          <motion.input
            animate={{ borderColor: searchFocused ? 'var(--ink)' : 'var(--border)' }}
            type="text"
            value={localSearch}
            onChange={handleSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search deadlines..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all"
            style={{
              background: 'var(--white)',
              color: 'var(--ink)',
              boxShadow: searchFocused ? '3px 3px 0 var(--ink)' : 'none',
            }}
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.88 }}
          className="p-2.5 rounded-xl border-2 relative"
          style={{ borderColor: 'var(--border)', background: 'var(--white)' }}
        >
          <Bell size={18} style={{ color: 'var(--ink-3)' }} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
        </motion.button>

        <div className="w-px h-6" style={{ background: 'var(--border)' }} />

        <div className="relative" ref={userMenuRef}>
          <motion.button
            onClick={() => setShowUserMenu((s) => !s)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl border-2 transition-all"
            style={{ borderColor: 'var(--border)', background: 'var(--white)' }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
              style={{ background: 'var(--ink)' }}
            >
              {avatar}
            </div>
            <span className="text-sm font-bold hidden sm:block" style={{ color: 'var(--ink)' }}>
              {displayName.split(' ')[0]}
            </span>
          </motion.button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] as any }}
                className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-2xl border-2 overflow-hidden"
                style={{ borderColor: 'var(--ink)', background: 'var(--white)', boxShadow: '4px 4px 0 var(--ink)' }}
              >
                <div className="px-4 py-3.5 border-b-2" style={{ borderColor: 'var(--border)', background: 'var(--paper)' }}>
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--ink)' }}>{user?.displayName}</p>
                  <p className="text-xs font-semibold truncate mt-0.5" style={{ color: 'var(--ink-4)' }}>{user?.email}</p>
                </div>
                <div className="p-2">
                  <motion.button
                    whileHover={{ background: '#FFF0EE' }}
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-bold rounded-xl transition-colors"
                    style={{ color: 'var(--accent)' }}
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
