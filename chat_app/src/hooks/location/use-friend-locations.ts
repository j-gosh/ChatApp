import { useCallback } from 'react';

import type { MapFriend } from '@/models/map-friend';
import { useServices } from '@/providers/ServicesProvider';
import { useSubscription, type Subscribe } from '@/hooks/use-subscription';

/** Live list of friends sharing their location with `userId`. */
export function useFriendLocations(userId: string) {
  const { locationService } = useServices();
  const subscribe = useCallback<Subscribe<MapFriend[]>>(
    (observer) => locationService.subscribeFriendLocations(userId, observer),
    [locationService, userId],
  );
  return useSubscription(subscribe);
}
