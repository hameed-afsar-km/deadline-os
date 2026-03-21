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
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px]"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <span className="w-10 h-10 rounded-xl grad-accent flex items-center justify-center text-white font-extrabold text-lg glow-accent">D</span>
          <span className="font-bold text-xl tracking-tight text-white">DeadlineOS</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Create your account</h1>
        <p className="text-sm text-[--c-muted] font-medium mb-8">Start managing your deadlines smarter.</p>

        {/* Google */}
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={handleGoogle}
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl glass-hi border border-white/[0.1] text-sm font-semibold text-white hover:border-white/20 transition-colors mb-6"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
          Continue with Google
        </motion.button>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.07]" /></div>
          <div className="relative flex justify-center"><span className="px-3 text-xs text-[--c-muted] font-medium glass" style={{ borderRadius: '99px' }}>or sign up with email</span></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[--c-muted] uppercase tracking-wide">Full Name</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[--c-muted] pointer-events-none" />
              <input
                type="text" required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="inp pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[--c-muted] uppercase tracking-wide">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[--c-muted] pointer-events-none" />
              <input
                type="email" required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="inp pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[--c-muted] uppercase tracking-wide">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[--c-muted] pointer-events-none" />
              <input
                type="password" required minLength={6}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 6 characters"
                className="inp pl-10"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold text-white grad-accent hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60 glow-accent mt-2"
          >
            {loading ? 'Creating account…' : <><span>Create account</span><ArrowRight size={15} /></>}
          </motion.button>
        </form>

        <p className="text-center text-sm text-[--c-muted] mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-violet-400 font-semibold hover:text-violet-300 transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </BeamsBackground>
  );
}
