import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import { withTimeout } from '@/utils/async';

const POSITION_TIMEOUT_MS = 10_000;

export type LocationStatus = 'checking' | 'granted' | 'denied' | 'unavailable';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationState {
  status: LocationStatus;
  canAskAgain: boolean;
  coordinates: Coordinates | null;
}

async function locate(update: (patch: Partial<LocationState>) => void): Promise<void> {
  const permission = await Location.requestForegroundPermissionsAsync();
  update({
    canAskAgain: permission.canAskAgain,
    status: permission.granted ? 'granted' : 'denied',
  });
  if (!permission.granted) return;

  // A cached fix shows something immediately; the fresh one replaces it.
  const lastKnown = await Location.getLastKnownPositionAsync();
  if (lastKnown) update({ coordinates: lastKnown.coords });
  const current = await withTimeout(
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
    POSITION_TIMEOUT_MS,
    'Location request timed out',
  );
  update({ coordinates: current.coords });
}

/**
 * Asks for when-in-use location permission and resolves the device position.
 * `request` re-asks (when the OS still allows it) and refreshes the position.
 */
export function useCurrentLocation() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<LocationState>({
    status: 'checking',
    canAskAgain: true,
    coordinates: null,
  });

  useEffect(() => {
    let cancelled = false;
    const update = (patch: Partial<LocationState>) => {
      if (!cancelled) setState((current) => ({ ...current, ...patch }));
    };
    locate(update).catch((error: unknown) => {
      console.error('[location] Could not get current position', error);
      if (!cancelled) {
        setState((current) =>
          current.status === 'granted' && current.coordinates
            ? current
            : { ...current, status: current.status === 'denied' ? 'denied' : 'unavailable' },
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return { ...state, request: () => setAttempt((count) => count + 1) };
}
