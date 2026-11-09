import { useCallback } from 'react';

import type { ChatUser } from '@/models/chat';
import { useServices } from '@/providers/ServicesProvider';
import { useSubscription, type Subscribe } from '@/hooks/use-subscription';

/** Live list of `userId`'s friends. */
export function useUserFriends(userId: string) {
  const { userService } = useServices();
  const subscribe = useCallback<Subscribe<ChatUser[]>>(
    (observer) => userService.subscribeFriends(userId, observer),
    [userService, userId],
  );
  return useSubscription(subscribe);
}
