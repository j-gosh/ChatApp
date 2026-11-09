import { Stack } from 'expo-router';

import { useLocationSharing } from '@/hooks/location/use-location-sharing';
import { SignedInUserProvider, useAuthState } from '@/providers/AuthStateProvider';
import { StreamVideoProvider } from '@/providers/StreamVideoProvider';
import { appBarTheme } from '@/theme/app-theme';

/** Applies the user's location sharing setting while they're signed in. */
function LocationSharing() {
  useLocationSharing();
  return null;
}

/** Screens reachable only while signed in. */
export default function SignedInLayout() {
  const { user } = useAuthState();
  // The root guard redirects away on sign-out; render nothing during that transition.
  if (!user) return null;

  return (
    <SignedInUserProvider user={user}>
      <LocationSharing />
      <StreamVideoProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: appBarTheme.backgroundColor },
            headerTintColor: appBarTheme.tintColor,
            headerBackButtonDisplayMode: 'minimal',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="messages" options={{ title: '' }} />
          <Stack.Screen name="profile" options={{ title: '' }} />
          <Stack.Screen name="friends" options={{ title: 'Friends' }} />
          <Stack.Screen name="camera" options={{ title: 'Camera' }} />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
          <Stack.Screen name="user/[userId]" options={{ title: '' }} />
          <Stack.Screen
            name="story/[userId]"
            options={{ headerShown: false, presentation: 'fullScreenModal', animation: 'fade' }}
          />
          <Stack.Screen
            name="snap/[snapId]"
            options={{ headerShown: false, presentation: 'fullScreenModal', animation: 'fade' }}
          />
        </Stack>
      </StreamVideoProvider>
    </SignedInUserProvider>
  );
}
