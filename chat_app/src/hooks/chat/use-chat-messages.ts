import { useMemo } from 'react';

import type { ChatMessage, Room } from '@/models/chat';
import { useServices } from '@/providers/ServicesProvider';
import { useSubscription, type Subscribe } from '@/hooks/use-subscription';

/** Live list of messages in `room`, newest first. Idle while `room` is null. */
export function useChatMessages(room: Room | null) {
  const { chatService } = useServices();
  const subscribe = useMemo<Subscribe<ChatMessage[]> | null>(
    () => (room ? (observer) => chatService.subscribeMessages(room, observer) : null),
    [chatService, room],
  );
  return useSubscription(subscribe);
}
