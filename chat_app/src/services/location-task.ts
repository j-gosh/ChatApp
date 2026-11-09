import { getAuth } from '@react-native-firebase/auth';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { connectToFirebaseEmulators } from '@/services/emulators';
import { FirebaseLocationService } from '@/services/location-service';

/** Background task that shares the signed-in user's location ("Always" sharing). */
export const BACKGROUND_LOCATION_TASK = 'background-location-sharing';

// Background tasks must be defined at module scope, before the app renders, so
// the OS can run this when it relaunches the app in the background.
TaskManager.defineTask<{ locations: Location.LocationObject[] }>(
  BACKGROUND_LOCATION_TASK,
  async ({ data, error }) => {
    if (error) {
      console.error('[location] Background update failed', error);
      return;
    }
    const user = getAuth().currentUser;
    if (!user) {
      await stopBackgroundLocationSharing();
      return;
    }
    const latest = data.locations.at(-1);
    if (!latest) return;

    connectToFirebaseEmulators();
    try {
      await new FirebaseLocationService().shareLocation(user, latest.coords);
    } catch (shareError) {
      console.error('[location] Could not share background location', shareError);
    }
  },
);

export async function startBackgroundLocationSharing(): Promise<void> {
  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.Balanced,
    distanceInterval: 200,
    deferredUpdatesInterval: 5 * 60 * 1000,
    pausesUpdatesAutomatically: true,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Sharing your location',
      notificationBody: 'Your friends can see where you are on the map.',
    },
  });
}

export async function stopBackgroundLocationSharing(): Promise<void> {
  if (await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }
}
