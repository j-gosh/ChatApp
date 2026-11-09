import { onSnapshot, setDoc, where } from '@react-native-firebase/firestore';

import type { MediaService } from '@/services/media-service';
import { FirebaseStoryService } from '@/services/story-service';

const mockOnSnapshot = jest.mocked(onSnapshot);
const mockSetDoc = jest.mocked(setDoc);
const mockWhere = jest.mocked(where);

function mediaService(): jest.Mocked<MediaService> {
  return {
    uploadImage: jest
      .fn()
      .mockResolvedValue({ storagePath: 'stories/me/s1/image.jpg', url: 'https://img/s1.jpg' }),
    getDownloadUrl: jest.fn(),
    deleteFile: jest.fn().mockResolvedValue(undefined),
  };
}

function storyDoc(id: string, createdAt: number, overrides: Record<string, unknown> = {}) {
  return {
    id,
    ref: { path: `stories/${id}` },
    data: () => ({
      ownerId: 'grace',
      ownerName: 'Grace',
      imageUrl: `https://img/${id}.jpg`,
      storagePath: `stories/grace/${id}/image.jpg`,
      visibility: 'everyone',
      createdAt,
      ...overrides,
    }),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('FirebaseStoryService.subscribeFeed', () => {
  it('waits for every query, then merges and de-duplicates newest first', () => {
    const listeners: ((snapshot: unknown) => void)[] = [];
    mockOnSnapshot.mockImplementation(((_query: unknown, onNext: (snapshot: unknown) => void) => {
      listeners.push(onNext);
      return jest.fn();
    }) as unknown as typeof onSnapshot);
    const observer = { next: jest.fn(), error: jest.fn() };

    new FirebaseStoryService(mediaService()).subscribeFeed('me', ['grace'], observer);
    expect(listeners).toHaveLength(2);

    listeners[0]?.({ docs: [storyDoc('s1', 10), storyDoc('s2', 30)] });
    expect(observer.next).not.toHaveBeenCalled();

    listeners[1]?.({
      docs: [storyDoc('s2', 30), storyDoc('s3', 20), storyDoc('bad', 5, { visibility: 'x' })],
    });
    expect(observer.next).toHaveBeenCalledWith([
      expect.objectContaining({ id: 's2' }),
      expect.objectContaining({ id: 's3' }),
      expect.objectContaining({ id: 's1' }),
    ]);
  });

  it('splits followed users into `in` queries of at most 30 and skips the user themselves', () => {
    mockOnSnapshot.mockImplementation((() => jest.fn()) as unknown as typeof onSnapshot);
    const ownerIds = ['me', ...Array.from({ length: 31 }, (_, index) => `user-${index}`)];

    new FirebaseStoryService(mediaService()).subscribeFeed('me', ownerIds, {
      next: jest.fn(),
      error: jest.fn(),
    });

    const inFilters = mockWhere.mock.calls.filter(([field]) => field === 'ownerId');
    expect(inFilters.map(([, , ids]) => (ids as string[]).length)).toEqual([30, 1]);
    expect(inFilters.flatMap(([, , ids]) => ids as string[])).not.toContain('me');
  });

  it('stops every listener on unsubscribe', () => {
    const unsubscribes = [jest.fn(), jest.fn()];
    let call = 0;
    mockOnSnapshot.mockImplementation((() => unsubscribes[call++]) as unknown as typeof onSnapshot);

    const unsubscribe = new FirebaseStoryService(mediaService()).subscribeFeed('me', ['grace'], {
      next: jest.fn(),
      error: jest.fn(),
    });
    unsubscribe();
    unsubscribes.forEach((stop) => expect(stop).toHaveBeenCalled());
  });
});

describe('FirebaseStoryService.postStory', () => {
  const input = {
    owner: { id: 'me', name: 'Ada' },
    localUri: 'file:///photo.jpg',
    caption: 'Hi',
    visibility: 'friends' as const,
  };

  it('uploads the photo, then creates the story visible only to the owner until functions add friends', async () => {
    const media = mediaService();
    await new FirebaseStoryService(media).postStory(input);

    expect(media.uploadImage).toHaveBeenCalledWith(
      'file:///photo.jpg',
      expect.stringMatching(/^stories\/me\/.+\/image\.jpg$/),
    );
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        ownerId: 'me',
        viewerIds: ['me'],
        visibility: 'friends',
        imageUrl: 'https://img/s1.jpg',
        ownerImageUrl: null,
      }),
    );
  });

  it('deletes the uploaded photo if the story could not be saved', async () => {
    const media = mediaService();
    mockSetDoc.mockRejectedValueOnce(new Error('permission-denied'));

    await expect(new FirebaseStoryService(media).postStory(input)).rejects.toThrow(
      'permission-denied',
    );
    expect(media.deleteFile).toHaveBeenCalledWith('stories/me/s1/image.jpg');
  });
});
