'use client';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* ── Background Mesh ── */}
      <div 
        aria-hidden
        className="fixed inset-0 z-0 pointer-events-none opacity-40"
        style={{
          background: `
            radial-gradient(at 10% 10%, rgba(139, 92, 246, 0.45) 0px, transparent 40%),
            radial-gradient(at 90% 15%, rgba(249, 115, 22, 0.35) 0px, transparent 40%),
            radial-gradient(at 85% 90%, rgba(6, 182, 212, 0.4) 0px, transparent 40%),
            radial-gradient(at 15% 85%, rgba(244, 63, 94, 0.35) 0px, transparent 40%)
          `
        }}
      />

      {/* ── Industrial Grid Layer ── */}
      <div 
        aria-hidden
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* ── Horizontal Scanline ── */}
      <div 
        aria-hidden
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(transparent 50%, rgba(0,0,0,0.5) 50%)`,
          backgroundSize: '100% 4px'
        }}
      />

      {/* ── Flowing Content ── */}
      <div className="relative z-10 flex-1 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
