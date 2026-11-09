import { useEffect, useState } from 'react';

import type { Observer, Unsubscribe } from '@/services/observer';

export type Subscribe<T> = (observer: Observer<T>) => Unsubscribe;

export interface SubscriptionState<T> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
}

interface Snapshot<T> {
  source: Subscribe<T> | null;
  data?: T;
  error?: Error;
}

/**
 * Subscribes to a live data source for as long as the component is mounted —
 * 
 *
 * `subscribe` must be memoized (e.g. with `useCallback`); a new function
 * identity resubscribes and resets to the loading state.
 */
export function useSubscription<T>(subscribe: Subscribe<T> | null): SubscriptionState<T> {
  const [snapshot, setSnapshot] = useState<Snapshot<T>>({ source: null });

  useEffect(() => {
    if (!subscribe) return;
    return subscribe({
      next: (data) => setSnapshot({ source: subscribe, data }),
      error: (error) => {
        console.error('[useSubscription]', error);
        setSnapshot((previous) => ({
          source: subscribe,
          data: previous.source === subscribe ? previous.data : undefined,
          error,
        }));
      },
    });
  }, [subscribe]);

  if (!subscribe) return { data: undefined, error: undefined, isLoading: false };
  if (snapshot.source !== subscribe) return { data: undefined, error: undefined, isLoading: true };
  return { data: snapshot.data, error: snapshot.error, isLoading: false };
}
