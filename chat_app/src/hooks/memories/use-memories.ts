import { useCallback } from 'react';

import type { Memory } from '@/models/memory';
import { useServices } from '@/providers/ServicesProvider';
import { useSubscription, type Subscribe } from '@/hooks/use-subscription';

/** Live list of `userId`'s memories, newest first. */
export function useMemories(userId: string) {
  const { memoryService } = useServices();
  const subscribe = useCallback<Subscribe<Memory[]>>(
    (observer) => memoryService.subscribeMemories(userId, observer),
    [memoryService, userId],
  );
  return useSubscription(subscribe);
}
