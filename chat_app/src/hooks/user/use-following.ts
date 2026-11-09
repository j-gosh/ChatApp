import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useServices } from '@/providers/ServicesProvider';
import { useSubscription, type Subscribe } from '@/hooks/use-subscription';

export const followingCountQueryKey = (userId: string) => ['followingCount', userId] as const;

/** Live ids of the people `userId` follows. */
export function useFollowing(userId: string) {
  const { userService } = useServices();
  const subscribe = useCallback<Subscribe<string[]>>(
    (observer) => userService.subscribeFollowing(userId, observer),
    [userService, userId],
  );
  return useSubscription(subscribe);
}

/** How many people `userId` follows. */
export function useFollowingCount(userId: string) {
  const { userService } = useServices();
  return useQuery({
    queryKey: followingCountQueryKey(userId),
    queryFn: () => userService.countFollowing(userId),
  });
}
