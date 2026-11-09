import { FlatList, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { ErrorState } from '@/components/ErrorState';
import { ListCardTile } from '@/components/ListCardTile';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { useOpenConversation } from '@/features/chats/use-open-conversation';
import { useAvailableUsers } from '@/hooks/chat/use-available-users';
import { getUserDisplayName } from '@/models/chat';

/**
 * Every registered chat user. Tapping one opens a direct conversation and adds
 * them to the signed-in user's friends.
 */
export function ActiveUsers() {
  const { data: users, error, isLoading } = useAvailableUsers();
  const openConversation = useOpenConversation({ addAsFriend: true });

  if (isLoading) return <LoadingAnimation />;
  if (error) return <ErrorState message="Couldn't load users." />;

  return (
    <FlatList
      data={users}
      keyExtractor={(user) => user.id}
      renderItem={({ item: user }) => (
        <ListCardTile
          title={getUserDisplayName(user) || 'Unnamed user'}
          disabled={openConversation.isPending}
          onPress={() => openConversation.mutate(user)}
        />
      )}
      ListEmptyComponent={<Text style={styles.empty}>No other users yet.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  empty: { padding: 18, textAlign: 'center' },
});
