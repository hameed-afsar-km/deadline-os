'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { signInWithEmail, signInWithGoogle } from '@/lib/auth';
import { useUserStore } from '@/store/useUserStore';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setMounted(true);
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  // Canvas particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; color: string;
    }[] = [];

    const colors = ['rgba(124,58,237,', 'rgba(99,102,241,', 'rgba(236,72,153,', 'rgba(6,182,212,'];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let raf: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.fill();
      });

      // Draw connection lines
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(124,58,237,${(1 - dist / 100) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      raf = requestAnimationFrame(animate);
    };
    animate();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Fill in all fields');
    setIsLoading(true);
    try {
      await signInWithEmail(email, password);
      toast.success('Welcome back! 👋');
      router.replace('/dashboard');
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Signed in with Google!');
      router.replace('/dashboard');
    } catch {
      toast.error('Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--bg-void)' }}>

      {/* Canvas particles */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)', filter: 'blur(80px)', animation: 'orb-drift 20s ease-in-out infinite' }} />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #ec4899, transparent)', filter: 'blur(80px)', animation: 'orb-drift-2 25s ease-in-out infinite' }} />
      </div>

      {/* Form Card */}
      <div className={`relative z-10 w-full max-w-md px-4 ${mounted ? 'animate-scale-in' : 'opacity-0'}`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse-glow"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #ec4899)' }}>
              <span className="text-white font-black text-xl">D</span>
            </div>
            <div>
              <span className="text-2xl font-black gradient-text">DeadlineOS</span>
              <p className="text-sm mt-1" style={{ color: 'var(--text-mid)' }}>Your smart deadline command center</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-0.5" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(124,58,237,0.4), rgba(236,72,153,0.2))' }}>
          <div className="rounded-3xl p-8" style={{ background: 'var(--bg-surface)' }}>
            <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--text-white)' }}>
              Sign in to your account
            </h1>

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={isLoading}
              className="magnetic-btn w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl mb-5 font-semibold text-sm transition-all duration-200 disabled:opacity-50"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-mid)', color: 'var(--text-bright)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: 'var(--border-dim)' }} />
              <span className="text-xs px-2" style={{ color: 'var(--text-faint)' }}>or</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border-dim)' }} />
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-mid)' }}>
                  Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: focusedField === 'email' ? '#8b5cf6' : 'var(--text-faint)', transition: 'color 0.2s' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all duration-200"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: `1px solid ${focusedField === 'email' ? '#7c3aed' : 'var(--border-dim)'}`,
                      color: 'var(--text-bright)',
                      boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(124,58,237,0.15), 0 0 20px rgba(124,58,237,0.08)' : 'none',
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-mid)' }}>
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: focusedField === 'password' ? '#8b5cf6' : 'var(--text-faint)', transition: 'color 0.2s' }} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 rounded-xl text-sm transition-all duration-200"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: `1px solid ${focusedField === 'password' ? '#7c3aed' : 'var(--border-dim)'}`,
                      color: 'var(--text-bright)',
                      boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(124,58,237,0.15), 0 0 20px rgba(124,58,237,0.08)' : 'none',
                    }}
                  />
                  <button type="button" onClick={() => setShowPw((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs p-1 rounded transition-colors hover:bg-white/10"
                    style={{ color: 'var(--text-faint)' }}>
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="magnetic-btn w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm text-white mt-2 disabled:opacity-50 glow-violet"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-dim)' }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold hover:underline" style={{ color: '#a78bfa' }}>
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
