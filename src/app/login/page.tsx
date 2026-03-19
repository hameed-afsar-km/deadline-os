'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signInWithEmail, signInWithGoogle } from '@/lib/auth';
import { useUserStore } from '@/store/useUserStore';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Mail, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router  = useRouter();
  const { user, loading } = useUserStore();
  const [email,    setEmail]  = useState('');
  const [password, setPass]   = useState('');
  const [showPw,   setShowPw] = useState(false);
  const [isLoad,   setLoad]   = useState(false);
  const [focused,  setFoc]    = useState<string | null>(null);
  const [mounted,  setMnt]    = useState(false);

  useEffect(() => {
    setMnt(true);
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Fill in all fields');
    setLoad(true);
    try { await signInWithEmail(email, password); toast.success('Welcome back!'); router.replace('/dashboard'); }
    catch { toast.error('Invalid email or password'); }
    finally { setLoad(false); }
  };

  const handleGoogle = async () => {
    setLoad(true);
    try { await signInWithGoogle(); toast.success('Signed in!'); router.replace('/dashboard'); }
    catch { toast.error('Google sign-in failed'); }
    finally { setLoad(false); }
  };

  if (!mounted) return null;

  const FIELDS = [
    { id: 'email',    label: 'Email address', type: 'email',                       value: email,    setter: setEmail, Icon: Mail, placeholder: 'you@example.com' },
    { id: 'password', label: 'Password',      type: showPw ? 'text' : 'password',  value: password, setter: setPass,  Icon: Lock, placeholder: '••••••••'       },
  ];

  return (
    <main className="min-h-screen flex" style={{ background: 'var(--paper)' }}>

      {/* ── Left panel (branding) ─────────────────── */}
      <div
        className="hidden lg:flex flex-col p-12 w-[44%] xl:w-[38%] border-r-2"
        style={{ borderColor: 'var(--ink)', background: 'var(--ink)', color: 'var(--paper)' }}
      >
        <div className="flex items-center gap-3 mb-auto">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-display font-black text-ink text-sm" style={{ color: 'var(--ink)' }}>D/</div>
          <span className="font-display font-black text-xl">DeadlineOS</span>
        </div>
        <div className="mb-auto">
          <h2 className="font-display font-black text-5xl leading-[0.95] tracking-tighter mb-6">
            Every deadline,<br /><span style={{ color: 'var(--accent)' }}>managed.</span>
          </h2>
          <p className="text-lg font-medium opacity-60 leading-relaxed max-w-xs">
            The sharpest task OS ever built. Sign back in and pick up exactly where you left off.
          </p>
        </div>
        {['Smart auto-priority', 'Real-time cloud sync', 'Live countdowns'].map((f) => (
          <div key={f} className="flex items-center gap-3 mb-3 last:mb-0">
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black" style={{ background: 'var(--accent)', color: '#fff' }}>✓</span>
            <span className="text-sm font-semibold opacity-70">{f}</span>
          </div>
        ))}
      </div>

      {/* ── Right panel (form) ───────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as any }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <h1 className="font-display font-black text-3xl mb-2" style={{ color: 'var(--ink)' }}>Welcome back.</h1>
            <p className="text-sm font-medium" style={{ color: 'var(--ink-4)' }}>Sign in to your account to continue.</p>
          </div>

          {/* Google */}
          <motion.button
            whileHover={{ x: -2, y: -2, boxShadow: '4px 4px 0 var(--ink)' }}
            whileTap={{ x: 0, y: 0, boxShadow: 'none' }}
            onClick={handleGoogle} disabled={isLoad}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl mb-6 font-bold text-sm border-2 transition-all disabled:opacity-50"
            style={{ borderColor: 'var(--ink)', background: 'var(--white)', color: 'var(--ink)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </motion.button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-0.5" style={{ background: 'var(--border)' }} />
            <span className="text-xs font-bold" style={{ color: 'var(--ink-4)' }}>or with email</span>
            <div className="flex-1 h-0.5" style={{ background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleEmail} className="space-y-4">
            {FIELDS.map(({ id, label, type, value, setter, Icon, placeholder }) => (
              <div key={id}>
                <label className="block text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--ink-4)' }}>
                  {label}
                </label>
                <div className="relative">
                  <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
                    style={{ color: focused === id ? 'var(--accent)' : 'var(--ink-4)' }} />
                  <input
                    type={type} value={value}
                    onChange={(e) => setter(e.target.value)}
                    onFocus={() => setFoc(id)}
                    onBlur={() => setFoc(null)}
                    placeholder={placeholder}
                    className={`w-full rounded-xl text-sm font-semibold border-2 transition-all ${id === 'password' ? 'pl-10 pr-12 py-3.5' : 'pl-10 pr-4 py-3.5'}`}
                    style={{
                      background: 'var(--white)',
                      color: 'var(--ink)',
                      borderColor: focused === id ? 'var(--ink)' : 'var(--border)',
                      boxShadow: focused === id ? '3px 3px 0 var(--ink)' : 'none',
                    }}
                  />
                  {id === 'password' && (
                    <button type="button" onClick={() => setShowPw((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors"
                      style={{ color: 'var(--ink-4)' }}>
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <motion.button
              type="submit" disabled={isLoad}
              whileHover={{ x: -2, y: -2, boxShadow: '4px 4px 0 rgba(0,0,0,0.3)' }}
              whileTap={{ x: 0, y: 0, boxShadow: 'none' }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-black text-sm text-white mt-2 border-2 disabled:opacity-50"
              style={{ background: 'var(--ink)', borderColor: 'var(--ink)' }}
            >
              {isLoad ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {isLoad ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm font-semibold" style={{ color: 'var(--ink-4)' }}>
            No account?{' '}
            <Link href="/signup" className="font-black underline underline-offset-2 hover:opacity-70" style={{ color: 'var(--ink)' }}>
              Create one free →
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
