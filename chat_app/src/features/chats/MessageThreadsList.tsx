import { router } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { ErrorState } from '@/components/ErrorState';
import { ListCardTile } from '@/components/ListCardTile';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { useChatRooms } from '@/hooks/chat/use-chat-rooms';
import { useChatStore } from '@/stores/chat-store';

/** The signed-in user's existing conversations. Tapping one opens it. */
export function MessageThreadsList() {
  const { data: rooms, error, isLoading } = useChatRooms();
  const selectRoom = useChatStore((state) => state.selectRoom);

  if (isLoading) return <LoadingAnimation />;
  if (error) return <ErrorState message="Couldn't load your conversations." />;

  return (
    <FlatList
      data={rooms}
      keyExtractor={(room) => room.id}
      renderItem={({ item: room }) => (
        <ListCardTile
          title={room.name ?? 'Conversation'}
          onPress={() => {
            selectRoom(room);
            router.push('/messages');
          }}
        />
      )}
      ListEmptyComponent={<Text style={styles.empty}>You have no messages.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  empty: { padding: 18, textAlign: 'center' },
});
