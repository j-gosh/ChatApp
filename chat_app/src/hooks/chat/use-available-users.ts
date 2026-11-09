import { useCallback } from 'react';

import type { ChatUser } from '@/models/chat';
import { useServices } from '@/providers/ServicesProvider';
import { useSubscription, type Subscribe } from '@/hooks/use-subscription';

/** Live list of every registered chat user except the signed-in user. */
export function useAvailableUsers() {
  const { chatService } = useServices();
  const subscribe = useCallback<Subscribe<ChatUser[]>>(
    (observer) => chatService.subscribeUsers(observer),
    [chatService],
  );
  return useSubscription(subscribe);
}
