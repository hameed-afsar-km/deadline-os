'use client';

import { useState } from 'react';
import { signInWithEmail, signInWithGoogle } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { BeamsBackground } from '@/components/ui/beams-background';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
    <BeamsBackground className="px-5 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] relative"
      >
        <div className="glass-hi hud-border p-8 md:p-10 rounded-2xl relative overflow-hidden">
          {/* Animated Scanning Line */}
          <motion.div
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute left-0 right-0 h-[1px] bg-cyan-500/20 z-0 pointer-events-none"
          />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-lg grad-accent flex items-center justify-center text-white font-bold text-lg glow-accent relative">
                D
                <div className="absolute -inset-1 border border-cyan-500/20 rounded-lg animate-pulse" />
              </div>
              <div>
                <span className="font-bold text-xl tracking-tighter text-white block leading-none">DEADLINE</span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-cyan-500 uppercase">Operating System</span>
              </div>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white mb-2 glow-text">Authentication Required</h1>
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-8">Access restricted to authorized personnel</p>

            {/* Google */}
            <motion.button
              whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.08)' }} whileTap={{ scale: 0.99 }}
              onClick={handleGoogle}
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 rounded-lg glass border border-white/[0.05] text-[13px] font-bold text-zinc-300 transition-all mb-8 uppercase tracking-wider"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://www.google.com/favicon.ico" className="w-3.5 h-3.5 grayscale brightness-200" alt="" />
              Authorize with Google
            </motion.button>

            {/* Divider */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.05]" /></div>
              <div className="relative flex justify-center">
                <span className="px-4 text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] bg-[#0A0A10]">Sequential Bypass</span>
              </div>
            </div>

            {/* Email form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Identity Identifier</label>
                  <span className="text-[9px] text-cyan-500 opacity-50 font-mono">@system.secure</span>
                </div>
                <div className="relative group">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-500 transition-colors pointer-events-none" />
                  <input
                    type="email" required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="EMAIL_ADDRESS"
                    className="inp pl-10 font-mono text-xs tracking-wider"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Access Cipher</label>
                  <span className="text-[9px] text-zinc-600 font-mono">AES_256_ENCRYPTED</span>
                </div>
                <div className="relative group">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-500 transition-colors pointer-events-none" />
                  <input
                    type="password" required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="inp pl-10 font-mono text-xs"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                type="submit" disabled={loading}
                className="w-full py-4 rounded-lg text-xs font-black text-white grad-accent hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 glow-accent uppercase tracking-[0.2em] shadow-lg shadow-cyan-500/20"
              >
                {loading ? 'Decrypting...' : <><span>Initialize Session</span><ArrowRight size={14} /></>}
              </motion.button>
            </form>

            <p className="text-center text-[11px] text-zinc-500 font-medium mt-10">
              New identity required?{' '}
              <Link href="/signup" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors uppercase tracking-wider">Register Unit</Link>
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-1 left-8 w-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        <div className="absolute -bottom-1 right-8 w-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      </motion.div>
    </BeamsBackground>
  );
}

