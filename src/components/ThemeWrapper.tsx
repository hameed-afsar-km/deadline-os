'use client';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full" style={{ background: 'var(--bg)' }}>
      {/* ── Dot grid — like Moleskine paper ── */}
      <div
        aria-hidden
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #B8B3A8 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          opacity: 0.35,
        }}
      />

      {/* ── Subtle warm vignette at edges ── */}
      <div
        aria-hidden
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(200,180,140,0.08) 0%, transparent 65%), radial-gradient(ellipse at 50% 100%, rgba(180,160,120,0.06) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
