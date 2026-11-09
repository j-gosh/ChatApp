import * as Location from 'expo-location';
import { useEffect } from 'react';

import { useIsAppActive } from '@/hooks/use-is-app-active';
import { useUserProfile } from '@/hooks/user/use-user-profile';
import { useSignedInUser } from '@/providers/AuthStateProvider';
import { useServices } from '@/providers/ServicesProvider';
import {
  startBackgroundLocationSharing,
  stopBackgroundLocationSharing,
} from '@/services/location-task';

const UPDATE_DISTANCE_METERS = 100;
const UPDATE_INTERVAL_MS = 60_000;

/**
 * Shares the signed-in user's location with friends according to their saved
 * setting: while the app is open ("whileUsing"), or also in the background
 * ("always"). Mounted once for the signed-in part of the app.
 */
export function useLocationSharing() {
  const user = useSignedInUser();
  const { locationService } = useServices();
  const { data: profile } = useUserProfile();
  const isAppActive = useIsAppActive();
  const mode = profile?.locationSharing;

  // "Always": background updates, which also run while the app is open.
  useEffect(() => {
    if (mode === undefined) return;
    const update =
      mode === 'always'
        ? Location.getBackgroundPermissionsAsync().then((permission) => {
            if (!permission.granted) {
              console.warn('[location] Background access revoked; not sharing in the background');
              return stopBackgroundLocationSharing();
            }
            return startBackgroundLocationSharing();
          })
        : stopBackgroundLocationSharing();
    update.catch((error: unknown) => {
      console.error('[location] Could not update background sharing', error);
    });
  }, [mode]);

  // "While using": foreground updates while the app is active.
  useEffect(() => {
    if (mode !== 'whileUsing' || !isAppActive) return;

    let cancelled = false;
    let subscription: Location.LocationSubscription | undefined;
    (async () => {
      const permission = await Location.getForegroundPermissionsAsync();
      if (!permission.granted) {
        console.warn('[location] Location access revoked; not sharing');
        return;
      }
      const watch = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: UPDATE_DISTANCE_METERS,
          timeInterval: UPDATE_INTERVAL_MS,
        },
        (position) => {
          locationService.shareLocation(user, position.coords).catch((error: unknown) => {
            console.error('[location] Could not share location', error);
          });
        },
      );
      if (cancelled) watch.remove();
      else subscription = watch;
    })().catch((error: unknown) => {
      console.error('[location] Could not watch position', error);
    });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [mode, isAppActive, user, locationService]);
}
