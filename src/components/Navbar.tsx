'use client';

import { logOut } from '@/lib/auth';
import { useUserStore } from '@/store/useUserStore';
import { useEventStore } from '@/store/useEventStore';
import { Bell, LogOut, Search, Menu, X, Command } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useRef, useEffect } from 'react';
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
  const [bellActive, setBellActive] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebouncedCallback((val: string) => {
    setSearchQuery(val);
  }, 300);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalSearch(e.target.value);
      debouncedSearch(e.target.value);
    },
    [debouncedSearch]
  );

  const handleLogout = async () => {
    await logOut();
    toast.success('Signed out. See you soon!');
    router.replace('/login');
  };

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const avatar = user?.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U';
  const displayName = user?.displayName ?? user?.email?.split('@')[0] ?? 'User';

  const notifGranted = typeof Notification !== 'undefined' && Notification.permission === 'granted';

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 h-16 glass-solid"
      style={{ borderBottom: '1px solid var(--border-dim)' }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-xl transition-all duration-200 hover:bg-white/8 active:scale-90"
          aria-label="Toggle menu"
        >
          <div className="relative w-5 h-5">
            <span className="absolute inset-0 flex items-center justify-center transition-all duration-200"
              style={{ opacity: sidebarOpen ? 1 : 0, transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
              <X size={18} style={{ color: 'var(--text-mid)' }} />
            </span>
            <span className="absolute inset-0 flex items-center justify-center transition-all duration-200"
              style={{ opacity: sidebarOpen ? 0 : 1, transform: sidebarOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
              <Menu size={18} style={{ color: 'var(--text-mid)' }} />
            </span>
          </div>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            <span className="text-white font-black text-sm">D</span>
          </div>
          <span className="font-black text-base gradient-text hidden sm:block tracking-tight">DeadlineOS</span>
        </div>
      </div>

      {/* Center: search */}
      <div className="flex-1 max-w-sm mx-4">
        <div className="relative group">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200"
            style={{ color: searchFocused ? '#8b5cf6' : 'var(--text-faint)' }} />
          <input
            type="text"
            value={localSearch}
            onChange={handleSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search deadlines..."
            className="w-full pl-9 pr-10 py-2 text-sm rounded-xl transition-all duration-200"
            style={{
              background: searchFocused ? 'var(--bg-raised)' : 'var(--bg-elevated)',
              border: `1px solid ${searchFocused ? '#7c3aed' : 'var(--border-dim)'}`,
              color: 'var(--text-bright)',
              boxShadow: searchFocused ? '0 0 0 3px rgba(124,58,237,0.12)' : 'none',
            }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-0.5 pointer-events-none"
            style={{ opacity: searchFocused ? 0 : 0.4 }}>
            <Command size={10} style={{ color: 'var(--text-faint)' }} />
            <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>K</span>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Bell */}
        <button
          className="relative p-2 rounded-xl transition-all duration-200 hover:bg-white/6 active:scale-90"
          aria-label="Notifications"
          onClick={() => {
            setBellActive(true);
            setTimeout(() => setBellActive(false), 600);
            if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
              Notification.requestPermission().then((p) => {
                if (p === 'granted') toast.success('Notifications enabled! 🔔');
              });
            }
          }}
        >
          <Bell size={18}
            style={{
              color: notifGranted ? '#10b981' : 'var(--text-mid)',
              transition: 'transform 0.3s ease',
              transform: bellActive ? 'rotate(-20deg)' : 'rotate(0deg)',
            }} />
          {!notifGranted && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-6 mx-1" style={{ background: 'var(--border-dim)' }} />

        {/* Avatar + dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu((s) => !s)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-200 hover:bg-white/5 active:scale-95"
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-violet-500/30"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7)' }}>
              {avatar}
            </div>
            <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--text-mid)' }}>
              {displayName.split(' ')[0]}
            </span>
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl py-2 animate-scale-in"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
              <div className="px-4 py-2 mb-1">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-white)' }}>{user?.displayName}</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-faint)' }}>{user?.email}</p>
              </div>
              <div className="h-px mx-2 mb-1" style={{ background: 'var(--border-dim)' }} />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-rose-500/10 rounded-xl mx-auto"
                style={{ color: '#f43f5e', width: 'calc(100% - 8px)', margin: '0 4px' }}
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
