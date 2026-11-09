import { useCallback } from 'react';

import type { ChatUser } from '@/models/chat';
import { useServices } from '@/providers/ServicesProvider';
import { useSubscription, type Subscribe } from '@/hooks/use-subscription';

/** Live public chat user (name and avatar). `data` is null if the user doesn't exist. */
export function useChatUser(userId: string) {
  const { userService } = useServices();
  const subscribe = useCallback<Subscribe<ChatUser | null>>(
    (observer) => userService.subscribeChatUser(userId, observer),
    [userService, userId],
  );
  return useSubscription(subscribe);
}
