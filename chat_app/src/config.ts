// `EXPO_PUBLIC_*` variables are inlined at build time, so they must be read by their full name.

/** Public Stream Video API key (the secret lives only in the Cloud Function). */
export const streamApiKey = process.env.EXPO_PUBLIC_STREAM_API_KEY;

/**
 * Host running the Firebase emulators (e.g. `localhost`, or `10.0.2.2` from an
 * Android emulator). Unset in normal builds.
 */
export const firebaseEmulatorHost = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST;
