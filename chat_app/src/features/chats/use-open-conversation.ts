import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';

import { useChatController } from '@/controllers/use-chat-controller';
import type { ChatUser } from '@/models/chat';
import { useSignedInUser } from '@/providers/AuthStateProvider';
import { useChatStore } from '@/stores/chat-store';
import { showSnackbar } from '@/stores/snackbar-store';

/**
 * Opens (creating if needed) the direct conversation with a user, then shows it.
 * With `addAsFriend`, also adds the user to the signed-in user's friends.
 */
export function useOpenConversation({ addAsFriend }: { addAsFriend: boolean }) {
  const chatController = useChatController();
  const { uid } = useSignedInUser();
  const selectRoom = useChatStore((state) => state.selectRoom);

  return useMutation({
    mutationFn: (user: ChatUser) =>
      addAsFriend ? chatController.startConversation(uid, user) : chatController.createRoom(user),
    onSuccess: (room) => {
      selectRoom(room);
      router.push('/messages');
    },
    onError: (error) => {
      console.error('[chat] Failed to open conversation', error);
      showSnackbar("Couldn't open the conversation. Please try again.");
    },
  });
}
