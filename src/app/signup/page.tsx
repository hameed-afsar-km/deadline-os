'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signUpWithEmail, signInWithGoogle } from '@/lib/auth';
import { useUserStore } from '@/store/useUserStore';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, User, Mail, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PERKS = [
  'Free forever · no credit card needed',
  'Real-time cloud sync across devices',
  'Smart auto-priority engine',
];

export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useUserStore();
  const [name,    setName]  = useState('');
  const [email,   setEmail] = useState('');
  const [pass,    setPass]  = useState('');
  const [showPw,  setShowPw]= useState(false);
  const [isLoad,  setLoad]  = useState(false);
  const [focused, setFoc]   = useState<string | null>(null);
  const [mounted, setMnt]   = useState(false);

  useEffect(() => {
    setMnt(true);
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !pass) return toast.error('Fill in all fields');
    if (pass.length < 6) return toast.error('Password must be 6+ chars');
    setLoad(true);
    try {
      await signUpWithEmail(email, pass, name);
      toast.success('Account created — welcome!');
      router.replace('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      toast.error(msg.includes('email-already-in-use') ? 'Email already registered' : 'Signup failed');
    } finally { setLoad(false); }
  };

  const handleGoogle = async () => {
    setLoad(true);
    try { await signInWithGoogle(); toast.success('Signed in!'); router.replace('/dashboard'); }
    catch { toast.error('Google sign-in failed'); }
    finally { setLoad(false); }
  };

  if (!mounted) return null;

  const FIELDS = [
    { id: 'name',     label: 'Full name',   type: 'text',                       value: name,  setter: setName,  Icon: User, placeholder: 'Alex Johnson'    },
    { id: 'email',    label: 'Email',       type: 'email',                      value: email, setter: setEmail, Icon: Mail, placeholder: 'you@example.com' },
    { id: 'password', label: 'Password',    type: showPw ? 'text' : 'password', value: pass,  setter: setPass,  Icon: Lock, placeholder: '6+ characters'   },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 py-14" style={{ background: 'var(--paper)' }}>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as any }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center font-display font-black text-white text-sm"
            style={{ background: 'var(--ink)' }}
          >
            D/
          </div>
          <div>
            <h1 className="font-display font-black text-xl" style={{ color: 'var(--ink)' }}>DeadlineOS</h1>
            <p className="text-xs font-semibold" style={{ color: 'var(--ink-4)' }}>Create your free account</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: 'var(--ink)', background: 'var(--white)' }}>

          {/* Header band */}
          <div className="px-8 py-5 border-b-2" style={{ borderColor: 'var(--border)', background: 'var(--paper)' }}>
            <h2 className="font-display font-black text-2xl" style={{ color: 'var(--ink)' }}>Join DeadlineOS</h2>
            <p className="text-sm font-medium mt-1" style={{ color: 'var(--ink-4)' }}>The sharpest productivity OS — free forever.</p>
          </div>

          <div className="p-8">
            {/* Google */}
            <motion.button
              whileHover={{ x: -2, y: -2, boxShadow: '4px 4px 0 var(--ink)' }}
              whileTap={{ x: 0, y: 0, boxShadow: 'none' }}
              onClick={handleGoogle} disabled={isLoad}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl mb-5 font-bold text-sm border-2 transition-all disabled:opacity-50"
              style={{ borderColor: 'var(--ink)', background: 'var(--paper)', color: 'var(--ink)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </motion.button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-0.5" style={{ background: 'var(--border)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--ink-4)' }}>or</span>
              <div className="flex-1 h-0.5" style={{ background: 'var(--border)' }} />
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
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
                      className={`w-full rounded-xl text-sm font-semibold border-2 transition-all bg-white ${id === 'password' ? 'pl-10 pr-12 py-3.5' : 'pl-10 pr-4 py-3.5'}`}
                      style={{
                        color: 'var(--ink)',
                        borderColor: focused === id ? 'var(--ink)' : 'var(--border)',
                        boxShadow: focused === id ? '3px 3px 0 var(--ink)' : 'none',
                      }}
                    />
                    {id === 'password' && (
                      <button type="button" onClick={() => setShowPw((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg"
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
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm text-white mt-2 border-2 disabled:opacity-50"
                style={{ background: 'var(--ink)', borderColor: 'var(--ink)' }}
              >
                {isLoad ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {isLoad ? 'Creating account...' : 'Create Account →'}
              </motion.button>
            </form>

            {/* Perks */}
            <div className="mt-5 space-y-2 pt-5 border-t-2" style={{ borderColor: 'var(--border)' }}>
              {PERKS.map((p) => (
                <div key={p} className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--ink-4)' }}>
                  <CheckCircle2 size={13} style={{ color: 'var(--accent-3)', flexShrink: 0 }} /> {p}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-sm font-semibold" style={{ color: 'var(--ink-4)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-black underline underline-offset-2 hover:opacity-70" style={{ color: 'var(--ink)' }}>
            Sign in →
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
