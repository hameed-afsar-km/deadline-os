'use client';

import { useState } from 'react';
import { signInWithEmail, signInWithGoogle } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Target } from 'lucide-react';
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
      toast.success('Connection established');
      router.push('/dashboard');
    } catch { toast.error('Access denied'); }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      toast.success('Secure OAuth link successful');
      router.push('/dashboard');
    } catch (err: any) { 
      console.error(err);
      toast.error(`OAuth Fault: ${err.code || err.message || 'Unknown'}`); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative font-sans text-zinc-100 selection:bg-cyan-500/30">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none mix-blend-screen" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[440px] glass-panel p-10 sm:p-14 rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,1)] border border-white/10 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[64px] -mx-20 -my-20 pointer-events-none" />

        <div className="flex flex-col items-center mb-12 relative z-10">
          <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.6 }} className="w-16 h-16 rounded-[20px] flex items-center justify-center text-white bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)] mb-8 border border-white/20">
            <Target size={28} strokeWidth={2} />
          </motion.div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-3">
            System Login
          </h1>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">Authenticate to proceed</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Identity Vector</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}
                placeholder="operator@nexus.com"
                className="w-full pl-12 pr-5 py-4 text-sm font-semibold bg-black/40 border border-white/10 rounded-2xl focus:bg-white/5 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all placeholder:text-zinc-700 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Access Key</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}
                placeholder="••••••••"
                className="w-full pl-12 pr-5 py-4 text-sm font-semibold bg-black/40 border border-white/10 rounded-2xl focus:bg-white/5 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all placeholder:text-zinc-700 text-white" />
            </div>
          </div>

          <button disabled={loading} type="submit"
            className="w-full py-4 mt-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 border border-indigo-400/50">
            {loading ? 'Decrypting...' : 'Establish Link'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="relative my-10 relative z-10">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
          <div className="relative flex justify-center"><span className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-700 glass-panel rounded-full blur-[0.5px]">OR</span></div>
        </div>

        <button onClick={handleGoogle}
          className="w-full py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-black tracking-widest uppercase transition-colors flex items-center justify-center gap-4 relative z-10 shadow-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
          Google OAuth
        </button>

        <p className="text-center text-zinc-500 text-xs font-bold uppercase tracking-widest mt-12 relative z-10">
          Node missing? <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 transition-colors drop-shadow-md">Initialize</Link>
        </p>
      </motion.div>
    </div>
  );
}
