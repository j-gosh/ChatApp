import { useMutation } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { ErrorState } from '@/components/ErrorState';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { UserAvatar } from '@/components/UserAvatar';
import { useChatController } from '@/controllers/use-chat-controller';
import { ProfileStat } from '@/features/profile/ProfileStat';
import { useChatUser } from '@/hooks/user/use-chat-user';
import { useFollowing, useFollowingCount } from '@/hooks/user/use-following';
import { useUserProfile } from '@/hooks/user/use-user-profile';
import { getUserDisplayName } from '@/models/chat';
import { useSignedInUser } from '@/providers/AuthStateProvider';
import { showSnackbar } from '@/stores/snackbar-store';
import { getDataErrorMessage } from '@/utils/errors';

/** Another user's profile, with their stats and a Follow button. */
export function SelectedProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { uid } = useSignedInUser();
  const chatController = useChatController();
  const chatUser = useChatUser(userId);
  const profile = useUserProfile(userId);
  const followingCount = useFollowingCount(userId);
  const myFollowing = useFollowing(uid);
  const isFollowing = myFollowing.data?.includes(userId) ?? false;

  const toggleFollow = useMutation({
    mutationFn: () =>
      isFollowing ? chatController.unfollow(uid, userId) : chatController.follow(uid, userId),
    onError: (error) => {
      console.error('[profile] Follow change failed', error);
      showSnackbar(`Couldn't update following: ${getDataErrorMessage(error)}`);
    },
  });

  if (chatUser.isLoading) return <LoadingAnimation />;
  if (chatUser.error) return <ErrorState message="Couldn't load this profile." />;
  if (!chatUser.data) return <ErrorState message="This user doesn't exist." />;

  const name = getUserDisplayName(chatUser.data) || profile.data?.userName || 'Unnamed user';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <UserAvatar
          size={100}
          name={name}
          imageUrl={chatUser.data.imageUrl}
          style={styles.avatar}
        />
        <Text variant="titleMedium">{name}</Text>
        {profile.data ? <Text variant="bodySmall">@{profile.data.userName}</Text> : null}
      </View>
      <View style={styles.stats}>
        <ProfileStat label="Snap Totals" value={profile.data?.snapCount ?? '–'} />
        <ProfileStat label="Following" value={followingCount.data ?? '–'} />
      </View>
      {userId !== uid ? (
        <Button
          mode={isFollowing ? 'outlined' : 'contained'}
          style={styles.follow}
          onPress={() => toggleFollow.mutate()}
          loading={toggleFollow.isPending}
          disabled={toggleFollow.isPending || myFollowing.isLoading}
        >
          {isFollowing ? 'Unfollow' : 'Follow'}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { alignItems: 'center', paddingTop: 20, paddingHorizontal: 10, gap: 4 },
  avatar: { marginBottom: 8 },
  stats: { flexDirection: 'row', justifyContent: 'space-evenly', paddingVertical: 12 },
  follow: { marginHorizontal: 24 },
});
