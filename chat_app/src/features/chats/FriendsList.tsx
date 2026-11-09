import { FlatList, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { ErrorState } from '@/components/ErrorState';
import { ListCardTile } from '@/components/ListCardTile';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { ActiveUsers } from '@/features/chats/ActiveUsers';
import { useOpenConversation } from '@/features/chats/use-open-conversation';
import { useUserFriends } from '@/hooks/user/use-user-friends';
import { getUserDisplayName } from '@/models/chat';
import { useSignedInUser } from '@/providers/AuthStateProvider';

/**
 * The signed-in user's friends. Tapping one opens your conversation with them.
 * With no friends yet, falls back to {@link ActiveUsers} to start a first conversation.
 */
export function FriendsList() {
  const { uid } = useSignedInUser();
  const { data: friends, error, isLoading } = useUserFriends(uid);
  const openConversation = useOpenConversation({ addAsFriend: false });

  if (isLoading) return <LoadingAnimation />;
  if (error) return <ErrorState message="Couldn't load your friends." />;

  if (!friends?.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>
          Your friends list is empty, but you can always start a conversation with someone and make
          a new friend
        </Text>
        <ActiveUsers />
      </View>
    );
  }

  return (
    <FlatList
      data={friends}
      keyExtractor={(friend) => friend.id}
      renderItem={({ item: friend }) => (
        <ListCardTile
          title={getUserDisplayName(friend) || 'Unnamed friend'}
          disabled={openConversation.isPending}
          onPress={() => openConversation.mutate(friend)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { padding: 18, textAlign: 'center' },
});
