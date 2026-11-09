import type { ConfigContext, ExpoConfig } from 'expo/config';

// Native secrets/config live outside git. Firebase config files default to the
// project root (gitignored) and can be overridden per environment.
const env = {
  googleServicesJson: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
  googleServiceInfoPlist: process.env.GOOGLE_SERVICE_INFO_PLIST ?? './GoogleService-Info.plist',
  mapsAndroidApiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY,
  mapsIosApiKey: process.env.GOOGLE_MAPS_IOS_API_KEY,
};

const missing = Object.entries({
  GOOGLE_MAPS_ANDROID_API_KEY: env.mapsAndroidApiKey,
  GOOGLE_MAPS_IOS_API_KEY: env.mapsIosApiKey,
  EXPO_PUBLIC_STREAM_API_KEY: process.env.EXPO_PUBLIC_STREAM_API_KEY,
})
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length > 0) {
  console.warn(`[app.config] Missing env vars: ${missing.join(', ')}. Maps/video will not work.`);
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'ChatApp',
  slug: 'chat-app',
  scheme: 'chatapp',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    bundleIdentifier: 'com.example.chatApp',
    supportsTablet: false,
    googleServicesFile: env.googleServiceInfoPlist,
    infoPlist: {
      NSCameraUsageDescription:
        'ChatApp uses the camera to take photos, record videos, and join video calls.',
      NSMicrophoneUsageDescription:
        'ChatApp uses the microphone to record videos and talk on video calls.',
    },
  },
  android: {
    package: 'com.example.chatapp',
    googleServicesFile: env.googleServicesJson,
    adaptiveIcon: {
      backgroundColor: '#FFC107',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    permissions: ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO'],
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      { image: './assets/splash-icon.png', imageWidth: 200, backgroundColor: '#FFFFFF' },
    ],
    // Firebase Apple SDK 13+ ships via SPM only, which requires dynamic frameworks.
    ['expo-build-properties', { ios: { useFrameworks: 'dynamic' } }],
    'expo-font',
    'expo-video',
    'expo-image',
    [
      'expo-location',
      {
        locationWhenInUsePermission: 'ChatApp shows your location on the map with your friends.',
        locationAlwaysAndWhenInUsePermission:
          'If you choose "Always" location sharing, ChatApp keeps your friends updated on your location while the app is closed.',
        isIosBackgroundLocationEnabled: true,
        isAndroidBackgroundLocationEnabled: true,
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'ChatApp lets you choose a profile photo from your library.',
        cameraPermission: 'ChatApp lets you take a profile photo with your camera.',
      },
    ],
    [
      'react-native-maps',
      {
        androidGoogleMapsApiKey: env.mapsAndroidApiKey,
        iosGoogleMapsApiKey: env.mapsIosApiKey,
      },
    ],
    '@react-native-firebase/app',
    '@react-native-firebase/auth',
    '@stream-io/video-react-native-sdk',
    [
      '@config-plugins/react-native-webrtc',
      {
        cameraPermission: 'ChatApp uses the camera for video calls.',
        microphonePermission: 'ChatApp uses the microphone for video calls.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
});
