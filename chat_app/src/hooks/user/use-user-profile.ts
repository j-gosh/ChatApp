import { useQuery } from '@tanstack/react-query';

import { useSignedInUser } from '@/providers/AuthStateProvider';
import { useServices } from '@/providers/ServicesProvider';

export const userProfileQueryKey = (userId: string) => ['userProfile', userId] as const;

/**
 * Loads a user's profile (the signed-in user's by default). Resolves to null if
 * it has not been created yet.
 */
export function useUserProfile(userId?: string) {
  const { userService } = useServices();
  const { uid } = useSignedInUser();
  const id = userId ?? uid;
  return useQuery({
    queryKey: userProfileQueryKey(id),
    queryFn: () => userService.getUserProfile(id),
  });
}
