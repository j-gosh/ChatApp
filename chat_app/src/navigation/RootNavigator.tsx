import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { useAuthState } from '@/providers/AuthStateProvider';

/**
 * Auth-aware routing: signed-in users can only reach the `(app)` group,
 * signed-out users only `/onboarding`. Switching auth state redirects automatically.
 */
export function RootNavigator() {
  const { user, isLoading } = useAuthState();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch((error: unknown) => {
        console.warn('[splash] Could not hide splash screen', error);
      });
    }
  }, [isLoading]);

  // The native splash screen stays up until Firebase reports the initial auth state.
  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={user !== null}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={user === null}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
    </Stack>
  );
}
