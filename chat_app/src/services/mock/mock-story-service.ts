import { StoryPostSchema, type StoryPost } from '@/models/story';
import { mockData, type MockDoc } from '@/mock-data';
import { parseDoc, toMillis } from '@/services/firestore-utils';
import { arrayContains, docs, emit, newestFirst } from '@/services/mock/mock-utils';
import type { Observer, Unsubscribe } from '@/services/observer';
import type { StoryService } from '@/services/story-service';

function toStoryPost([id, data]: [string, MockDoc]): StoryPost[] {
  const fields = parseDoc(StoryPostSchema, `stories/${id}`, data);
  return fields ? [{ ...fields, id, createdAt: toMillis(data.createdAt) }] : [];
}

/** Read-only {@link StoryService} backed by `src/mock-data`. Writes resolve without saving. */
export class MockStoryService implements StoryService {
  subscribeFeed(userId: string, ownerIds: string[], observer: Observer<StoryPost[]>): Unsubscribe {
    const owners = new Set(ownerIds.filter((id) => id !== userId));
    // Same as the Firebase queries: stories shared with the user, plus "everyone"
    // stories from `ownerIds`.
    return emit(observer, () =>
      docs(mockData.stories)
        .filter(
          ([, data]) =>
            arrayContains(data, 'viewerIds', userId) ||
            (data.visibility === 'everyone' &&
              typeof data.ownerId === 'string' &&
              owners.has(data.ownerId)),
        )
        .sort(newestFirst('createdAt'))
        .flatMap(toStoryPost),
    );
  }

  subscribeOwnStories(userId: string, observer: Observer<StoryPost[]>): Unsubscribe {
    return emit(observer, () =>
      docs(mockData.stories)
        .filter(([, data]) => data.ownerId === userId)
        .sort(newestFirst('createdAt'))
        .flatMap(toStoryPost),
    );
  }

  async postStory(): Promise<void> {}

  async setVisibility(): Promise<void> {}

  async deleteStory(): Promise<void> {}
}
