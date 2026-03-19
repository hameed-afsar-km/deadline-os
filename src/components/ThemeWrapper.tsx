'use client';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative min-h-screen w-full font-sans"
      style={{ background: 'var(--paper)', color: 'var(--ink)' }}
    >
      {/* Decorative grid pattern */}
      <div
        aria-hidden
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(var(--ink) 1px, transparent 1px),
            linear-gradient(90deg, var(--ink) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      <div className="relative z-10 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
