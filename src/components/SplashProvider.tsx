'use client';

import { useState, useEffect } from 'react';
import { SplashScreen } from '@/components/SplashScreen';

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const [splashDone, setSplashDone] = useState(false);
  const [mounted,    setMounted]    = useState(false);

  // Avoid hydration mismatch – only run on client
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <>{children}</>;

  return (
    <>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      {/* children always rendered so Next.js doesn't remount the whole tree */}
      <div style={{ opacity: splashDone ? 1 : 0, transition: 'opacity 0.5s ease 0.1s' }}>
        {children}
      </div>
    </>
  );
}
