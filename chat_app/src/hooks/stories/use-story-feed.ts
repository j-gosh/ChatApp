import { useMemo } from 'react';

import { useFollowing } from '@/hooks/user/use-following';
import { useUserFriends } from '@/hooks/user/use-user-friends';
import { groupStoriesByOwner, type StoryPost } from '@/models/story';
import { useSignedInUser } from '@/providers/AuthStateProvider';
import { useServices } from '@/providers/ServicesProvider';
import { useSubscription, type Subscribe } from '@/hooks/use-subscription';

/**
 * Stories in the signed-in user's Discover feed, grouped by owner (own stories
 * first): stories shared with them by people who added them as a friend, plus
 * "everyone" stories from people they follow or added.
 */
export function useStoryFeed() {
  const { uid } = useSignedInUser();
  const { storyService } = useServices();
  const following = useFollowing(uid);
  const friends = useUserFriends(uid);

  const isReady = !following.isLoading && !friends.isLoading;
  // A stable key, so the feed only resubscribes when the set of people changes.
  const ownerKey = isReady
    ? [...new Set([...(following.data ?? []), ...(friends.data ?? []).map((friend) => friend.id)])]
        .sort()
        .join(',')
    : null;

  const subscribe = useMemo<Subscribe<StoryPost[]> | null>(
    () =>
      ownerKey === null
        ? null
        : (observer) =>
            storyService.subscribeFeed(uid, ownerKey ? ownerKey.split(',') : [], observer),
    [storyService, uid, ownerKey],
  );
  const feed = useSubscription(subscribe);
  const stories = useMemo(() => feed.data && groupStoriesByOwner(feed.data, uid), [feed.data, uid]);

  return { data: stories, error: feed.error, isLoading: !isReady || feed.isLoading };
}
