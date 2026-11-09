import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { followingCountQueryKey } from '@/hooks/user/use-following';
import type { ChatUser, PartialText, Room } from '@/models/chat';
import { useServices } from '@/providers/ServicesProvider';

/** Chat, friend, and follow business logic, delegated to the chat and user services. */
export function useChatController() {
  const { chatService, userService } = useServices();
  const queryClient = useQueryClient();

  return useMemo(
    () => ({
      sendMessage(message: PartialText, roomId: string): Promise<void> {
        return chatService.sendMessage(message, roomId);
      },

      /** Returns the existing direct room with `otherUser`, or creates one. */
      createRoom(otherUser: ChatUser): Promise<Room> {
        return chatService.createRoom(otherUser);
      },

      updateRoom(room: Room): Promise<void> {
        return chatService.updateRoom(room);
      },

      /** Adds `user` to the friends list of `userId`. */
      addFriend(userId: string, user: ChatUser): Promise<void> {
        return userService.addUserToFriendsList(userId, user);
      },

      /** Opens a direct room with `user` and adds them as a friend of `currentUserId`. */
      async startConversation(currentUserId: string, user: ChatUser): Promise<Room> {
        const [room] = await Promise.all([
          chatService.createRoom(user),
          userService.addUserToFriendsList(currentUserId, user),
        ]);
        return room;
      },

      /** Makes `userId` follow `targetId`. */
      async follow(userId: string, targetId: string): Promise<void> {
        await userService.follow(userId, targetId);
        await queryClient.invalidateQueries({ queryKey: followingCountQueryKey(userId) });
      },

      async unfollow(userId: string, targetId: string): Promise<void> {
        await userService.unfollow(userId, targetId);
        await queryClient.invalidateQueries({ queryKey: followingCountQueryKey(userId) });
      },
    }),
    [chatService, queryClient, userService],
  );
}
