import { useCallback } from 'react';

import type { StoryPost } from '@/models/story';
import { useServices } from '@/providers/ServicesProvider';
import { useSubscription, type Subscribe } from '@/hooks/use-subscription';

/** Live list of `userId`'s own stories, newest first. */
export function useOwnStories(userId: string) {
  const { storyService } = useServices();
  const subscribe = useCallback<Subscribe<StoryPost[]>>(
    (observer) => storyService.subscribeOwnStories(userId, observer),
    [storyService, userId],
  );
  return useSubscription(subscribe);
}
