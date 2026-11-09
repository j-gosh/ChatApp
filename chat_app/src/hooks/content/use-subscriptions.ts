import { useQuery } from '@tanstack/react-query';

import { useServices } from '@/providers/ServicesProvider';

/** Subscriptions shown in the Discover feed, in display order. */
export function useSubscriptions() {
  const { contentService } = useServices();
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => contentService.getSubscriptions(),
  });
}
