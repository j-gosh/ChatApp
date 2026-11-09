import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { RootNavigator } from '@/navigation/RootNavigator';
import { AppProviders } from '@/providers/AppProviders';
// Registers the background location task; must run before the app renders.
import '@/services/location-task';

// Keep the native splash screen up until Firebase reports the initial auth state.
SplashScreen.preventAutoHideAsync().catch((error: unknown) => {
  console.warn('[splash] Could not prevent auto hide', error);
});

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="light" />
      <RootNavigator />
    </AppProviders>
  );
}
