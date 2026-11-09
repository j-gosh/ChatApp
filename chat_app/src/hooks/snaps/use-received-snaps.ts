import { useCallback } from 'react';

import type { Snap } from '@/models/snap';
import { useServices } from '@/providers/ServicesProvider';
import { useSubscription, type Subscribe } from '@/hooks/use-subscription';

/** Live list of unopened snaps sent to `userId`, newest first. */
export function useReceivedSnaps(userId: string) {
  const { snapService } = useServices();
  const subscribe = useCallback<Subscribe<Snap[]>>(
    (observer) => snapService.subscribeReceivedSnaps(userId, observer),
    [snapService, userId],
  );
  return useSubscription(subscribe);
}
