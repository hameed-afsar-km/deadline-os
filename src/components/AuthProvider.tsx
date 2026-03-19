'use client';

import { useEffect } from 'react';
import { onAuthChange } from '@/lib/auth';
import { useUserStore } from '@/store/useUserStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useUserStore();

  useEffect(() => {
    const unsub = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsub();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
