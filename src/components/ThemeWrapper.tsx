'use client';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex flex-col font-sans bg-slate-50 overflow-x-hidden">
      {/* ── Subtle Professional Background ── */}
      <div 
        aria-hidden
        className="fixed inset-x-0 top-0 h-[500px] z-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(226, 232, 240, 0.5) 0%, rgba(248, 250, 252, 0) 100%)',
        }}
      />
      
      {/* ── Soft Grid ── */}
      <div 
        aria-hidden
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.4]"
        style={{
          backgroundImage: `
            radial-gradient(#CBD5E1 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      />

      {/* ── Flowing Content ── */}
      <div className="relative z-10 flex-1 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
