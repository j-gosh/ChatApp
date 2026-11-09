import { router, Stack } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { GiftedChat, MessageText, type IMessage } from 'react-native-gifted-chat';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState } from '@/components/ErrorState';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { useChatController } from '@/controllers/use-chat-controller';
import { toGiftedMessage } from '@/features/chats/to-gifted-message';
import { useChatMessages } from '@/hooks/chat/use-chat-messages';
import { useSignedInUser } from '@/providers/AuthStateProvider';
import { useChatStore } from '@/stores/chat-store';
import { showSnackbar } from '@/stores/snackbar-store';
import { isSingleEmoji } from '@/utils/emoji';

/**
 * Conversation screen for the selected room. Messages stream live; a lone
 * emoji is shown enlarged.
 */
export function MessagesScreen() {
  const currentUser = useSignedInUser();
  const room = useChatStore((state) => state.selectedRoom);
  const chatController = useChatController();
  const { data: messages, error, isLoading } = useChatMessages(room);

  const giftedMessages = useMemo(() => messages?.map(toGiftedMessage) ?? [], [messages]);

  if (!room) {
    return (
      <View style={styles.centered}>
        <Text>No user or room selected</Text>
        <Button onPress={() => router.back()}>Go back</Button>
      </View>
    );
  }

  const send = (newMessages: IMessage[]) => {
    for (const message of newMessages) {
      chatController.sendMessage({ text: message.text }, room.id).catch((sendError: unknown) => {
        console.error('[chat] Failed to send message', sendError);
        showSnackbar('Message failed to send.');
      });
    }
  };

  const title = room.name ?? (giftedMessages.length === 0 ? 'New Message' : '');

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title }} />
      {isLoading ? (
        <LoadingAnimation />
      ) : error ? (
        <ErrorState message="Couldn't load messages." />
      ) : (
        <GiftedChat
          messages={giftedMessages}
          onSend={send}
          user={{ _id: currentUser.uid }}
          isUsernameVisible
          disableKeyboardProvider
          renderMessageText={(props) =>
            props.currentMessage && isSingleEmoji(props.currentMessage.text) ? (
              <Text style={styles.emoji}>{props.currentMessage.text}</Text>
            ) : (
              <MessageText {...props} />
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emoji: { fontSize: 40, lineHeight: 48, padding: 6 },
});
