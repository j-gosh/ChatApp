import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';

import { ActiveUsers } from '@/features/chats/ActiveUsers';
import { FriendsList } from '@/features/chats/FriendsList';
import { MessageThreadsList } from '@/features/chats/MessageThreadsList';
import { useUiStore } from '@/stores/ui-store';

/**
 * Chat tab. Shows existing conversations, or — after tapping "New" — the
 * user's friends and all active users to start a conversation with.
 */
export function ChatScreen() {
  const chatPage = useUiStore((state) => state.chatPage);
  const friendsPage = useUiStore((state) => state.friendsPage);
  const setChatPage = useUiStore((state) => state.setChatPage);
  const setFriendsPage = useUiStore((state) => state.setFriendsPage);

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <Button mode="elevated" onPress={() => setChatPage('threads')}>
          Chats
        </Button>
        {chatPage === 'threads' ? (
          <Button mode="elevated" icon="plus" onPress={() => setChatPage('friends')}>
            New
          </Button>
        ) : (
          <>
            <Button mode="elevated" onPress={() => setFriendsPage('friends')}>
              Friends
            </Button>
            <Button mode="elevated" onPress={() => setFriendsPage('activeUsers')}>
              Active Users
            </Button>
          </>
        )}
      </View>
      <View style={styles.content}>
        {chatPage === 'threads' ? (
          <MessageThreadsList />
        ) : friendsPage === 'friends' ? (
          <FriendsList />
        ) : (
          <ActiveUsers />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  actions: { flexDirection: 'row', justifyContent: 'space-evenly', paddingVertical: 8 },
  content: { flex: 1, paddingHorizontal: 10 },
});
