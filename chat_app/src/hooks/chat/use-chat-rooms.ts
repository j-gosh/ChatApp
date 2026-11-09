import { useCallback } from 'react';

import type { Room } from '@/models/chat';
import { useServices } from '@/providers/ServicesProvider';
import { useSubscription, type Subscribe } from '@/hooks/use-subscription';

/** Live list of the signed-in user's chat rooms, most recently updated first. */
export function useChatRooms() {
  const { chatService } = useServices();
  const subscribe = useCallback<Subscribe<Room[]>>(
    (observer) => chatService.subscribeRooms(observer),
    [chatService],
  );
  return useSubscription(subscribe);
}
