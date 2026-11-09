import { useMutation } from '@tanstack/react-query';
import { Alert, Linking, ScrollView, StyleSheet } from 'react-native';
import { ActivityIndicator, Button, Divider, List, RadioButton, Text } from 'react-native-paper';

import { ErrorState } from '@/components/ErrorState';
import { useAuthController } from '@/controllers/use-auth-controller';
import {
  LocationPermissionError,
  useLocationController,
} from '@/controllers/use-location-controller';
import { useUserProfile } from '@/hooks/user/use-user-profile';
import type { LocationSharingMode } from '@/models/user-profile';
import { showSnackbar } from '@/stores/snackbar-store';
import { getDataErrorMessage } from '@/utils/errors';

const SHARING_OPTIONS: { value: LocationSharingMode; title: string; description: string }[] = [
  { value: 'off', title: 'Off', description: 'Friends can’t see your location.' },
  {
    value: 'whileUsing',
    title: 'While using the app',
    description: 'Friends see your location while ChatApp is open.',
  },
  {
    value: 'always',
    title: 'Always',
    description: 'Friends keep seeing your location while ChatApp is closed.',
  },
];

function openSettings() {
  Linking.openSettings().catch((error: unknown) => {
    console.error('[settings] Could not open settings', error);
  });
}

/** Account settings: location sharing with friends, and signing out. */
export function SettingsScreen() {
  const profile = useUserProfile();
  const authController = useAuthController();
  const locationController = useLocationController();

  const setSharing = useMutation({
    mutationFn: (mode: LocationSharingMode) => locationController.setSharingMode(mode),
    onSuccess: (applied, requested) => {
      if (applied !== requested) {
        showSnackbar(
          'Background location access was not allowed, so you’re sharing only while using the app.',
        );
      }
    },
    onError: (error) => {
      if (error instanceof LocationPermissionError) {
        Alert.alert(
          'Location access needed',
          error.message,
          error.canAskAgain
            ? undefined
            : [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: openSettings },
              ],
        );
        return;
      }
      console.error('[settings] Changing location sharing failed', error);
      showSnackbar(`Couldn't change location sharing: ${getDataErrorMessage(error)}`);
    },
  });

  const confirmSignOut = () =>
    Alert.alert('Sign out?', 'You will need to sign in again to use the app.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          authController.signOut().catch((error: unknown) => {
            console.error('[auth] Sign out failed', error);
            showSnackbar("Couldn't sign out. Please try again.");
          });
        },
      },
    ]);

  const currentMode = setSharing.isPending
    ? setSharing.variables
    : (profile.data?.locationSharing ?? 'off');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <List.Subheader>Share my location with friends</List.Subheader>
      {profile.isLoading ? (
        <ActivityIndicator />
      ) : profile.error || !profile.data ? (
        <ErrorState
          message="Couldn't load your settings. Finish setting up your profile first if you haven't."
          onRetry={() => profile.refetch()}
        />
      ) : (
        <RadioButton.Group
          value={currentMode}
          onValueChange={(value) => setSharing.mutate(value as LocationSharingMode)}
        >
          {SHARING_OPTIONS.map((option) => (
            <RadioButton.Item
              key={option.value}
              value={option.value}
              label={`${option.title}\n${option.description}`}
              disabled={setSharing.isPending}
              accessibilityLabel={option.title}
            />
          ))}
        </RadioButton.Group>
      )}
      <Text variant="bodySmall" style={styles.note}>
        Only people on your friends list can see your location.
      </Text>
      <Divider style={styles.divider} />
      <Button mode="outlined" onPress={confirmSignOut} accessibilityLabel="Sign out">
        Sign out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 12, paddingBottom: 32 },
  note: { paddingHorizontal: 16, paddingTop: 4 },
  divider: { marginVertical: 20 },
});
