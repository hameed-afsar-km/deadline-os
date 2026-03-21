'use client';

import { useState } from 'react';
import { signInWithEmail, signInWithGoogle } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { BeamsBackground } from '@/components/ui/beams-background';
import { GlowingShadow } from '@/components/ui/glowing-shadow';
import { useUserStore } from '@/store/useUserStore';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, loading: authLoading } = useUserStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) router.replace('/dashboard');
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmail(form.email, form.password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err?.code === 'auth/invalid-credential' ? 'Invalid email or password.' : (err?.message || 'Sign in failed.');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      toast.success('Signed in with Google');
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      toast.error(`OAuth Fault: ${err.code || err.message || 'Unknown'}`);
    }
  };

  return (
    <BeamsBackground className="px-6 py-20 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px]"
      >
        <div className="glass-hi p-10 md:p-12 rounded-[28px] shadow-2xl border border-white/10 relative overflow-hidden">
          {/* Integrated Back Button */}
          <Link href="/" className="absolute top-8 left-8 w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all active:scale-95 group z-20" title="Return Home">
            <ArrowLeft size={18} />
          </Link>
          {/* Subtle Background Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)' }} />

          <div className="relative z-10">
            <div className="flex flex-col items-center mb-10 text-center">
              <span className="font-black text-2xl text-white tracking-tighter mb-4">DeadlineOS</span>
              <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Welcome Back</h1>
              <p className="text-sm text-zinc-400 font-medium tracking-tight">Sign in to manage your productivity orbit</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors pointer-events-none" />
                  <input
                    type="email" required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="name@company.com"
                    className="inp pl-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Password</label>
                  <Link href="#" className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Forgot?</Link>
                </div>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors pointer-events-none" />
                  <input
                    type="password" required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="inp pl-12"
                  />
                </div>
              </div>

              <GlowingShadow
                type="submit" disabled={loading}
                className="mt-4"
              >
                <div className="flex items-center gap-2 text-sm font-bold">
                  {loading ? 'Signing in...' : <><LogIn size={18} /> Sign in Account</>}
                </div>
              </GlowingShadow>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.08]" /></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black text-zinc-500">
                <span className="px-4 bg-transparent backdrop-blur-md">Or Connect With</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.04)' }} whileTap={{ scale: 0.99 }}
              onClick={handleGoogle}
              type="button"
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl glass border border-white/[0.05] text-[13px] font-bold text-zinc-300 transition-all hover:border-white/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale opacity-70" alt="" />
              Continue with Google
            </motion.button>

            <p className="text-center text-sm text-zinc-500 font-medium mt-10">
              New to DeadlineOS?{' '}
              <Link href="/signup" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">Create Account</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </BeamsBackground>
  );
}
