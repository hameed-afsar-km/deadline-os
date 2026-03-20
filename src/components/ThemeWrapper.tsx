'use client';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full" style={{ background: 'var(--bg)', color: 'var(--t1)' }}>
      {/* Warm ambient glow — feels like a warm evening light */}
      <div aria-hidden className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Primary warm center glow */}
        <div
          className="absolute top-[-15%] left-[30%] w-[50%] aspect-square rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle at center, #F59E0B 0%, #B45309 40%, transparent 70%)',
            filter: 'blur(120px)',
            animation: 'orbit 40s linear infinite',
          }}
        />
        {/* Subtle rose corner */}
        <div
          className="absolute bottom-[-10%] right-[-5%] w-[35%] aspect-square rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle at center, #FB7185 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
        {/* Very subtle violet left */}
        <div
          className="absolute top-[40%] left-[-10%] w-[30%] aspect-square rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle at center, #C4B5FD 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
      </div>

      {/* Fine grain noise overlay */}
      <div
        aria-hidden
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
