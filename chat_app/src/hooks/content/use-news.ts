import { useQuery } from '@tanstack/react-query';

import { useServices } from '@/providers/ServicesProvider';

/** Latest news articles for the Discover feed. */
export function useNews() {
  const { contentService } = useServices();
  return useQuery({ queryKey: ['news'], queryFn: () => contentService.getNews() });
}
