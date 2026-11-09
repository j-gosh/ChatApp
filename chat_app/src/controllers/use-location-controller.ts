import { useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { useMemo } from 'react';

import { userProfileQueryKey } from '@/hooks/user/use-user-profile';
import type { LocationSharingMode } from '@/models/user-profile';
import { useSignedInUser } from '@/providers/AuthStateProvider';
import { useServices } from '@/providers/ServicesProvider';
import { stopBackgroundLocationSharing } from '@/services/location-task';

/** Thrown when location sharing can't be turned on because location access was denied. */
export class LocationPermissionError extends Error {
  constructor(readonly canAskAgain: boolean) {
    super('Location access is needed to share your location.');
    this.name = 'LocationPermissionError';
  }
}

/** Location sharing settings. `useLocationSharing` applies the saved mode on this device. */
export function useLocationController() {
  const { uid } = useSignedInUser();
  const { locationService, userService } = useServices();
  const queryClient = useQueryClient();

  return useMemo(
    () => ({
      /**
       * Saves the sharing mode, asking for location access as needed.
       * Returns the mode applied: "always" falls back to "whileUsing" without background access.
       * @throws {LocationPermissionError} if location access is denied.
       */
      async setSharingMode(mode: LocationSharingMode): Promise<LocationSharingMode> {
        let applied = mode;
        if (mode !== 'off') {
          const foreground = await Location.requestForegroundPermissionsAsync();
          if (!foreground.granted) throw new LocationPermissionError(foreground.canAskAgain);
          if (mode === 'always') {
            const background = await Location.requestBackgroundPermissionsAsync();
            if (!background.granted) applied = 'whileUsing';
          }
        }

        if (applied === 'off') {
          await stopBackgroundLocationSharing();
          await locationService.stopSharing(uid);
        }
        await userService.setLocationSharing(uid, applied);
        await queryClient.invalidateQueries({ queryKey: userProfileQueryKey(uid) });
        return applied;
      },
    }),
    [locationService, queryClient, uid, userService],
  );
}
