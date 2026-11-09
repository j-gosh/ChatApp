import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { UserAvatar } from '@/components/UserAvatar';
import { useChatUser } from '@/hooks/user/use-chat-user';
import { getUserDisplayName } from '@/models/chat';
import { useSignedInUser } from '@/providers/AuthStateProvider';

/** The signed-in user's avatar for app-bar actions. Opens the profile screen. */
export function ProfileAvatar() {
  const user = useSignedInUser();
  const { data: chatUser } = useChatUser(user.uid);
  const name = (chatUser && getUserDisplayName(chatUser)) || user.displayName || '';

  return (
    <Pressable
      onPress={() => router.push('/profile')}
      accessibilityRole="button"
      accessibilityLabel="Open profile"
      style={styles.avatar}
    >
      <UserAvatar size={36} name={name} imageUrl={chatUser?.imageUrl} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: { marginHorizontal: 12 },
});
