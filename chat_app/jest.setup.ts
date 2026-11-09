/* eslint-disable @typescript-eslint/no-require-imports */
// Library-provided mocks for native modules.
require('react-native-gesture-handler/jestSetup');
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
jest.mock('react-native-keyboard-controller', () =>
  require('react-native-keyboard-controller/jest'),
);
jest.mock('@gorhom/bottom-sheet', () => require('@gorhom/bottom-sheet/mock'));

// Tests inject mock services, so the Firebase SDKs only need to be importable.
jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
  connectAuthEmulator: jest.fn(),
}));
jest.mock('@react-native-firebase/firestore', () => {
  class Timestamp {
    mockMillis: number;
    constructor(mockMillis: number) {
      this.mockMillis = mockMillis;
    }
    toMillis() {
      return this.mockMillis;
    }
  }
  return {
    Timestamp,
    getFirestore: jest.fn(() => ({})),
    collection: jest.fn((_db: unknown, ...path: string[]) => ({ path: path.join('/') })),
    doc: jest.fn((_db: unknown, ...path: string[]) => ({ path: path.join('/') })),
    query: jest.fn((ref: unknown) => ref),
    where: jest.fn(),
    orderBy: jest.fn(),
    onSnapshot: jest.fn(() => jest.fn()),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    getCountFromServer: jest.fn(),
    addDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    limit: jest.fn(),
    writeBatch: jest.fn(),
    serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
    connectFirestoreEmulator: jest.fn(),
  };
});
jest.mock('@react-native-firebase/functions', () => ({
  getFunctions: jest.fn(),
  httpsCallable: jest.fn(),
  connectFunctionsEmulator: jest.fn(),
}));

jest.mock('@react-native-firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn((_storage: unknown, path: string) => ({ fullPath: path })),
  putFile: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn(),
  connectStorageEmulator: jest.fn(),
}));

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(),
  requestBackgroundPermissionsAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
  getBackgroundPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
  getLastKnownPositionAsync: jest.fn().mockResolvedValue(null),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  startLocationUpdatesAsync: jest.fn().mockResolvedValue(undefined),
  stopLocationUpdatesAsync: jest.fn().mockResolvedValue(undefined),
  hasStartedLocationUpdatesAsync: jest.fn().mockResolvedValue(false),
}));

jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
  isTaskRegisteredAsync: jest.fn().mockResolvedValue(false),
}));

jest.mock('expo-image-picker', () => ({
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

jest.mock('@stream-io/video-react-native-sdk', () => ({
  StreamVideoClient: jest.fn(),
  StreamVideo: ({ children }: { children: unknown }) => children,
  StreamCall: ({ children }: { children: unknown }) => children,
  RingingCallContent: () => null,
  CallContent: () => null,
  useCalls: () => [],
}));
