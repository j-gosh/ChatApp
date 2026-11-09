import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type QueryDocumentSnapshot,
} from '@react-native-firebase/firestore';

import { StoryPostSchema, type StoryPost, type StoryVisibility } from '@/models/story';
import { chunk, parseDoc, toMillis } from '@/services/firestore-utils';
import { discardUpload, type MediaService } from '@/services/media-service';
import type { Observer, Unsubscribe } from '@/services/observer';

const STORIES_COLLECTION = 'stories';
const FEED_LIMIT = 100;
// Firestore allows at most 30 values in an `in` filter.
const MAX_IN_VALUES = 30;

export interface PostStoryInput {
  owner: { id: string; name: string; imageUrl?: string };
  localUri: string;
  caption: string;
  visibility: StoryVisibility;
}

/**
 * Contract for stories. The concrete implementation is {@link FirebaseStoryService}.
 *
 * Friends-only access is enforced by the `viewerIds` field (owner + owner's
 * friends), which Cloud Functions keep in sync with the friends list.
 */
export interface StoryService {
  /**
   * Live feed for `userId`: every story they may view from people who added them
   * as a friend, plus "everyone" stories from `ownerIds` (people they follow or
   * added). Newest first.
   */
  subscribeFeed(userId: string, ownerIds: string[], observer: Observer<StoryPost[]>): Unsubscribe;

  /** Live list of `userId`'s own stories, newest first. */
  subscribeOwnStories(userId: string, observer: Observer<StoryPost[]>): Unsubscribe;

  postStory(input: PostStoryInput): Promise<void>;

  setVisibility(storyId: string, visibility: StoryVisibility): Promise<void>;

  /** Deletes the story. Cloud Functions remove its photo. */
  deleteStory(storyId: string): Promise<void>;
}

function toStoryPost(snapshot: QueryDocumentSnapshot): StoryPost | undefined {
  const data = snapshot.data({ serverTimestamps: 'estimate' });
  const fields = parseDoc(StoryPostSchema, snapshot.ref.path, data);
  return fields && { ...fields, id: snapshot.id, createdAt: toMillis(data.createdAt) };
}

/** Firestore-backed implementation of {@link StoryService}. */
export class FirebaseStoryService implements StoryService {
  private readonly db = getFirestore();

  constructor(private readonly mediaService: MediaService) {}

  subscribeFeed(userId: string, ownerIds: string[], observer: Observer<StoryPost[]>): Unsubscribe {
    const stories = collection(this.db, STORIES_COLLECTION);
    // Every query must be constrained to documents the rules let this user read.
    const queries = [
      query(
        stories,
        where('viewerIds', 'array-contains', userId),
        orderBy('createdAt', 'desc'),
        limit(FEED_LIMIT),
      ),
      ...chunk(
        [...new Set(ownerIds)].filter((id) => id !== userId),
        MAX_IN_VALUES,
      ).map((ids) =>
        query(
          stories,
          where('visibility', '==', 'everyone'),
          where('ownerId', 'in', ids),
          orderBy('createdAt', 'desc'),
          limit(FEED_LIMIT),
        ),
      ),
    ];

    // Deliver a merged list once every query has reported, then on each change.
    const results: (StoryPost[] | undefined)[] = queries.map(() => undefined);
    const emit = () => {
      if (results.some((result) => result === undefined)) return;
      const merged = new Map<string, StoryPost>();
      for (const post of results.flat()) if (post) merged.set(post.id, post);
      observer.next([...merged.values()].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)));
    };

    const unsubscribes = queries.map((feedQuery, index) =>
      onSnapshot(
        feedQuery,
        (snapshot) => {
          results[index] = snapshot.docs.flatMap((storyDoc) => toStoryPost(storyDoc) ?? []);
          emit();
        },
        observer.error,
      ),
    );
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }

  subscribeOwnStories(userId: string, observer: Observer<StoryPost[]>): Unsubscribe {
    return onSnapshot(
      query(
        collection(this.db, STORIES_COLLECTION),
        where('ownerId', '==', userId),
        orderBy('createdAt', 'desc'),
      ),
      (snapshot) => observer.next(snapshot.docs.flatMap((storyDoc) => toStoryPost(storyDoc) ?? [])),
      observer.error,
    );
  }

  async postStory({ owner, localUri, caption, visibility }: PostStoryInput): Promise<void> {
    const storyRef = doc(collection(this.db, STORIES_COLLECTION));
    const { storagePath, url } = await this.mediaService.uploadImage(
      localUri,
      `${STORIES_COLLECTION}/${owner.id}/${storyRef.id}/image.jpg`,
    );
    try {
      await setDoc(storyRef, {
        ownerId: owner.id,
        ownerName: owner.name,
        ownerImageUrl: owner.imageUrl ?? null,
        imageUrl: url,
        storagePath,
        caption,
        visibility,
        viewerIds: [owner.id],
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      discardUpload(this.mediaService, storagePath);
      throw error;
    }
  }

  async setVisibility(storyId: string, visibility: StoryVisibility): Promise<void> {
    await updateDoc(doc(this.db, STORIES_COLLECTION, storyId), { visibility });
  }

  async deleteStory(storyId: string): Promise<void> {
    await deleteDoc(doc(this.db, STORIES_COLLECTION, storyId));
  }
}
