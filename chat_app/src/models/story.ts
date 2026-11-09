import { z } from 'zod';

export const STORY_VISIBILITIES = ['everyone', 'friends'] as const;

/** Who can see a story: anyone, or only the poster's friends. */
export type StoryVisibility = (typeof STORY_VISIBILITIES)[number];

/** Fields of a Firestore `stories/{id}` document (one photo per document). */
export const StoryPostSchema = z.object({
  ownerId: z.string(),
  ownerName: z.string(),
  ownerImageUrl: z.string().nullish(),
  imageUrl: z.string(),
  storagePath: z.string(),
  caption: z.string().default(''),
  visibility: z.enum(STORY_VISIBILITIES),
});

export type StoryPost = z.infer<typeof StoryPostSchema> & {
  id: string;
  /** Milliseconds since epoch. */
  createdAt?: number;
};

/** One user's stories as shown in the Discover row and the story viewer. Items are oldest first. */
export interface Story {
  userId: string;
  displayName: string;
  imageUrl?: string | null;
  items: StoryPost[];
}

/**
 * Groups story posts by owner. The current user's stories come first, then
 * everyone else ordered by their most recent post.
 */
export function groupStoriesByOwner(posts: StoryPost[], currentUserId: string): Story[] {
  const groups = new Map<string, Story & { latest: number }>();
  for (const post of posts) {
    const group = groups.get(post.ownerId) ?? {
      userId: post.ownerId,
      displayName: post.ownerName,
      imageUrl: post.ownerImageUrl,
      items: [],
      latest: 0,
    };
    group.items.push(post);
    group.latest = Math.max(group.latest, post.createdAt ?? 0);
    groups.set(post.ownerId, group);
  }

  return [...groups.values()]
    .sort((a, b) => {
      if (a.userId === currentUserId) return -1;
      if (b.userId === currentUserId) return 1;
      return b.latest - a.latest;
    })
    .map(({ latest: _latest, ...story }) => ({
      ...story,
      items: [...story.items].sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0)),
    }));
}
