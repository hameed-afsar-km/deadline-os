'use client';

import { useState } from 'react';
import { signInWithEmail, signInWithGoogle } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmail(form.email, form.password);
      toast.success('Signed in successfully');
      router.push('/dashboard');
    } catch { toast.error('Invalid email or password'); }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      toast.success('Signed in with Google');
      router.push('/dashboard');
    } catch { toast.error('Google sign-in failed'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-slate-50 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold bg-blue-600 shadow-md shadow-blue-600/20 mb-6">
            D
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500 font-medium">Please enter your details to sign in.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 ml-0.5">Email address</label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}
                placeholder="you@company.com"
                className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 text-slate-900" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 ml-0.5">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 text-slate-900" />
            </div>
          </div>

          <button disabled={loading} type="submit"
            className="w-full py-3 mt-4 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            {loading ? 'Signing in...' : 'Sign in'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
          <div className="relative flex justify-center"><span className="px-4 text-xs font-medium text-slate-400 bg-white">Or continue with</span></div>
        </div>

        <button onClick={handleGoogle}
          className="w-full py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors flex items-center justify-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
          Google
        </button>

        <p className="text-center text-slate-500 text-sm font-medium mt-8">
          Don't have an account? <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
