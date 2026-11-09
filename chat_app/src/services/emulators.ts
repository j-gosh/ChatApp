import { connectAuthEmulator, getAuth } from '@react-native-firebase/auth';
import { connectFirestoreEmulator, getFirestore } from '@react-native-firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from '@react-native-firebase/functions';
import { connectStorageEmulator, getStorage } from '@react-native-firebase/storage';

import { firebaseEmulatorHost } from '@/config';

let connected = false;

/**
 * Points Firebase at the local emulators (ports from the repo's firebase.json)
 * when `EXPO_PUBLIC_FIREBASE_EMULATOR_HOST` is set. Used for end-to-end tests.
 */
export function connectToFirebaseEmulators(): void {
  if (!firebaseEmulatorHost || connected) return;
  connected = true;
  connectAuthEmulator(getAuth(), `http://${firebaseEmulatorHost}:9099`);
  connectFirestoreEmulator(getFirestore(), firebaseEmulatorHost, 8080);
  connectFunctionsEmulator(getFunctions(), firebaseEmulatorHost, 5001);
  connectStorageEmulator(getStorage(), firebaseEmulatorHost, 9199);
  console.warn(`[firebase] Using emulators at ${firebaseEmulatorHost}`);
}
