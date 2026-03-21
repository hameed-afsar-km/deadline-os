'use client';

import { useState } from 'react';
import { signUpWithEmail, signInWithGoogle } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { BeamsBackground } from '@/components/ui/beams-background';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await signUpWithEmail(form.email, form.password, form.name);
      toast.success('Account created! Welcome to DeadlineOS.');
      router.push('/dashboard');
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/email-already-in-use') toast.error('An account with this email already exists.');
      else if (code === 'auth/weak-password') toast.error('Password is too weak.');
      else toast.error(err?.message || 'Registration failed.');
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
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
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

            <h1 className="text-2xl font-bold tracking-tight text-white mb-2 glow-text">Initialize Identity</h1>
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-8">Register new operator unit into the system</p>

            {/* Google */}
            <motion.button
              whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.08)' }} whileTap={{ scale: 0.99 }}
              onClick={handleGoogle}
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 rounded-lg glass border border-white/[0.05] text-[13px] font-bold text-zinc-300 transition-all mb-8 uppercase tracking-wider"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://www.google.com/favicon.ico" className="w-3.5 h-3.5 grayscale brightness-200" alt="" />
              Sync with Google
            </motion.button>

            {/* Divider */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.05]" /></div>
              <div className="relative flex justify-center">
                <span className="px-4 text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] bg-[#0A0A10]">Manual Registration</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Operator Designation</label>
                <div className="relative group">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-500 transition-colors pointer-events-none" />
                  <input
                    type="text" required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="FULL_NAME"
                    className="inp pl-10 font-mono text-xs tracking-wider"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Digital Identifier</label>
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
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Security Cipher</label>
                <div className="relative group">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-500 transition-colors pointer-events-none" />
                  <input
                    type="password" required minLength={6}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="CIPHER_SEQUENCE"
                    className="inp pl-10 font-mono text-xs"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                type="submit" disabled={loading}
                className="w-full py-4 rounded-lg text-xs font-black text-white grad-accent hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 glow-accent uppercase tracking-[0.2em] shadow-lg shadow-cyan-500/20 mt-4"
              >
                {loading ? 'Processing...' : <><span>Create Operator</span><ArrowRight size={14} /></>}
              </motion.button>
            </form>

            <p className="text-center text-[11px] text-zinc-500 font-medium mt-10">
              Already verified?{' '}
              <Link href="/login" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors uppercase tracking-wider">Initialize Login</Link>
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
