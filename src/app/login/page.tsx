'use client';

import { useState } from 'react';
import { signInWithEmail, signInWithGoogle } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, LogIn, ChevronRight, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmail(form.email, form.password);
      toast.success('DECRYPTION_SUCCESS');
      router.push('/dashboard');
    } catch { toast.error('INVALID_SYSTEM_KEYS'); }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      toast.success('OAUTH_BYPASS_SUCCESS');
      router.push('/dashboard');
    } catch { toast.error('HANDSHAKE_FAILED'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-[#020617] overflow-hidden">
      {/* ── Fixed Accents ── */}
      <div className="absolute top-0 left-0 w-full h-[1px] opacity-20" style={{ background: 'linear-gradient(90deg, transparent, #8B5CF6, transparent)' }} />
      <div className="absolute bottom-0 left-0 w-full h-[1px] opacity-20" style={{ background: 'linear-gradient(90deg, transparent, #F97316, transparent)' }} />

      <motion.div 
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'circOut' }}
        className="relative z-10 w-full max-w-lg cyber-panel p-10 lg:p-14 glass-card border-white/10"
      >
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 bg-violet-600 blur-[80px]" />
        
        <div className="flex flex-col items-center mb-12">
          <motion.div initial={{ scale:0, rotate:-180 }} animate={{ scale:1, rotate:0 }} transition={{ duration:0.6, type:'spring' }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-3xl font-black bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-[0_10px_30px_rgba(139,92,246,0.5)] mb-8">
            D
          </motion.div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-violet-500 mb-2">{"// SECURITY_GATE_04"}</p>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter text-center leading-[0.9]" style={{ fontFamily:'var(--font-heading)' }}>
            RECLAIM THE <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-orange-400">FLOWSTATE.</span>
          </h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-500 transition-colors" size={18} />
            <input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}
              placeholder="IDENTITY_STRING"
              className="w-full pl-14 pr-6 py-5 text-xs font-black tracking-widest uppercase bg-white/5 border border-white/10 rounded-2xl focus:border-violet-500/50 outline-none transition-all placeholder:text-slate-700 font-mono" />
          </div>

          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-500 transition-colors" size={18} />
            <input type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}
              placeholder="ACCESS_TOKEN"
              className="w-full pl-14 pr-6 py-5 text-xs font-black tracking-widest uppercase bg-white/5 border border-white/10 rounded-2xl focus:border-violet-500/50 outline-none transition-all placeholder:text-slate-700 font-mono" />
          </div>

          <motion.button disabled={loading} type="submit" whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
            className="w-full py-5 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-widest shadow-xl shadow-white/10 hover:bg-slate-100 transition-all flex items-center justify-center gap-3">
            {loading ? 'INITIALIZING...' : 'BYPASS_SECURITY →'}
          </motion.button>
        </form>

        <div className="relative my-10 py-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
          <div className="relative flex justify-center"><span className="px-4 text-[9px] font-bold text-slate-700 uppercase tracking-[0.3em] bg-[#020617]">OR_HANDSHAKE_VIA</span></div>
        </div>

        <motion.button onClick={handleGoogle} whileHover={{ scale:1.02, backgroundColor:'rgba(255,255,255,0.06)' }} whileTap={{ scale:0.98 }}
          className="w-full py-4 rounded-2xl border border-white/10 bg-white/5 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale opacity-60" alt="" />
          OAUTH_PROTOCOL
        </motion.button>

        <p className="text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] mt-12">
          NEW ENTITY? <Link href="/signup" className="text-violet-500 hover:text-violet-400 font-black transition-all">INITIALIZE_SEQUENCE</Link>
        </p>
      </motion.div>
    </div>
  );
}
