'use client';

import { useEffect } from 'react';
import { onAuthChange } from '@/lib/auth';
import { subscribeToEvents } from '@/lib/firestore';
import { useUserStore } from '@/store/useUserStore';
import { useEventStore } from '@/store/useEventStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useUserStore();
  const setEvents = useEventStore(state => state.setEvents);

  useEffect(() => {
    let unsubEvents: (() => void) | undefined;

    const unsubAuth = onAuthChange((user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        unsubEvents = subscribeToEvents(user.uid, (data) => setEvents(data));
      } else {
        setEvents([]);
        if (unsubEvents) unsubEvents();
      }
    });

    return () => {
      unsubAuth();
      if (unsubEvents) unsubEvents();
    };
  }, [setUser, setLoading, setEvents]);

  return <>{children}</>;
}
