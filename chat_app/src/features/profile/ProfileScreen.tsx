import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, IconButton, SegmentedButtons, Text } from 'react-native-paper';

import { ErrorState } from '@/components/ErrorState';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuthController } from '@/controllers/use-auth-controller';
import { useMediaController } from '@/controllers/use-media-controller';
import {
  CameraPermissionError,
  pickProfilePhoto,
  type PhotoSource,
} from '@/features/profile/pick-profile-photo';
import { ProfileMemoriesTab } from '@/features/profile/ProfileMemoriesTab';
import { ProfileStat } from '@/features/profile/ProfileStat';
import { ProfileStoriesTab } from '@/features/profile/ProfileStoriesTab';
import { ReceivedSnapsList } from '@/features/profile/ReceivedSnapsList';
import { useChatUser } from '@/hooks/user/use-chat-user';
import { useFollowingCount } from '@/hooks/user/use-following';
import { useUserFriends } from '@/hooks/user/use-user-friends';
import { useUserProfile } from '@/hooks/user/use-user-profile';
import { getUserDisplayName } from '@/models/chat';
import { useSignedInUser } from '@/providers/AuthStateProvider';
import { showSnackbar } from '@/stores/snackbar-store';
import { palette } from '@/theme/app-theme';
import { getDataErrorMessage } from '@/utils/errors';

/** Which content tab the profile shows. */
type ProfileTab = 'snaps' | 'stories' | 'memories';

function openSettings() {
  Linking.openSettings().catch((error: unknown) => {
    console.error('[profile] Could not open settings', error);
  });
}

/** The signed-in user's profile: avatar, name, stats, and their snaps/stories/memories. */
export function ProfileScreen() {
  const user = useSignedInUser();
  const authController = useAuthController();
  const mediaController = useMediaController();
  const profile = useUserProfile();
  const chatUser = useChatUser(user.uid);
  const friends = useUserFriends(user.uid);
  const followingCount = useFollowingCount(user.uid);
  const [tab, setTab] = useState<ProfileTab>('snaps');
  const [isRepairing, setIsRepairing] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);

  const name = (chatUser.data && getUserDisplayName(chatUser.data)) || user.displayName || '';

  const repairProfile = async () => {
    setIsRepairing(true);
    try {
      await authController.repairProfile(user);
    } catch (error) {
      console.error('[profile] Repair failed', error);
      showSnackbar("Couldn't finish setting up your profile.");
    } finally {
      setIsRepairing(false);
    }
  };

  const changePhoto = async (source: PhotoSource) => {
    try {
      const uri = await pickProfilePhoto(source);
      if (!uri) return;
      setIsUpdatingPhoto(true);
      await mediaController.updateAvatar(uri);
    } catch (error) {
      if (error instanceof CameraPermissionError) {
        Alert.alert(
          'Camera access needed',
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
      console.error('[profile] Updating the profile photo failed', error);
      showSnackbar(`Couldn't update your photo: ${getDataErrorMessage(error)}`);
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  const showPhotoOptions = () =>
    Alert.alert('Profile photo', undefined, [
      { text: 'Take photo', onPress: () => void changePhoto('camera') },
      { text: 'Choose photo', onPress: () => void changePhoto('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <IconButton
              icon="cog"
              iconColor={palette.white}
              onPress={() => router.push('/settings')}
              accessibilityLabel="Settings"
            />
          ),
        }}
      />
      <View style={styles.header}>
        <Pressable
          onPress={showPhotoOptions}
          disabled={isUpdatingPhoto}
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
        >
          <UserAvatar size={100} name={name} imageUrl={chatUser.data?.imageUrl} />
          {isUpdatingPhoto ? <ActivityIndicator style={styles.photoSpinner} /> : null}
        </Pressable>
        {profile.isLoading ? (
          <ActivityIndicator style={styles.headerText} />
        ) : profile.error ? (
          <ErrorState message="Couldn't load your profile." onRetry={() => profile.refetch()} />
        ) : profile.data ? (
          <>
            <Text variant="titleMedium" style={styles.headerText}>
              {profile.data.userName}
            </Text>
            <Text variant="bodySmall" selectable>
              {user.uid}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.headerText}>{"Your profile isn't set up yet."}</Text>
            <Button
              mode="contained"
              onPress={repairProfile}
              loading={isRepairing}
              disabled={isRepairing}
            >
              Finish setup
            </Button>
          </>
        )}
      </View>
      <View style={styles.stats}>
        <ProfileStat label="Snap Totals" value={profile.data?.snapCount ?? '–'} />
        <ProfileStat
          label="Friends"
          value={friends.data?.length ?? '–'}
          onPress={() => router.push('/friends')}
        />
        <ProfileStat label="Following" value={followingCount.data ?? '–'} />
      </View>
      <SegmentedButtons
        style={styles.tabs}
        value={tab}
        onValueChange={(value) => setTab(value as ProfileTab)}
        buttons={[
          { value: 'snaps', label: 'Snaps' },
          { value: 'stories', label: 'Stories' },
          { value: 'memories', label: 'Memories' },
        ]}
      />
      <View style={styles.grid}>
        {tab === 'snaps' ? <ReceivedSnapsList userId={user.uid} /> : null}
        {tab === 'stories' ? <ProfileStoriesTab userId={user.uid} /> : null}
        {tab === 'memories' ? <ProfileMemoriesTab userId={user.uid} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { alignItems: 'center', paddingTop: 20, paddingHorizontal: 10, gap: 4 },
  headerText: { marginTop: 8 },
  photoSpinner: { ...StyleSheet.absoluteFill },
  stats: { flexDirection: 'row', justifyContent: 'space-evenly', paddingVertical: 12 },
  tabs: { marginHorizontal: 10, marginBottom: 10 },
  grid: { flex: 1, paddingHorizontal: 10 },
});
