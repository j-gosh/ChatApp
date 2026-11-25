import type { ChatMessage } from '@/models/chat';
import type { Services } from '@/providers/ServicesProvider';
import { createMockDataServices } from '@/services/mock';
import type { Observer, Unsubscribe } from '@/services/observer';

/** Resolves with the first value a mock subscription delivers. */
function firstValue<T>(subscribe: (observer: Observer<T>) => Unsubscribe): Promise<T> {
  return new Promise((resolve, reject) => {
    subscribe({ next: resolve, error: reject });
  });
}

async function signedInServices(email = 'ada@example.com'): Promise<Services> {
  const services = createMockDataServices();
  await services.authService.signInWithEmailAndPassword(email, 'password123');
  return services;
}

describe('mock data services', () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // `parseDoc` warns when it skips a document, so any other warning means a broken fixture.
    const fixtureWarnings = warn.mock.calls.filter(
      ([message]) => !String(message).startsWith('[mock]'),
    );
    expect(fixtureWarnings).toEqual([]);
    warn.mockRestore();
  });

  describe('auth', () => {
    it('starts signed out and reports sign-in and sign-out', async () => {
      const { authService } = createMockDataServices();
      const listener = jest.fn();
      authService.onAuthStateChanged(listener);
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(listener).toHaveBeenLastCalledWith(null);

      const { user } = await authService.signInWithEmailAndPassword(
        ' ADA@example.com ',
        'password123',
      );
      expect(user).toMatchObject({ uid: 'ada', displayName: 'Ada Lovelace' });
      expect(authService.currentUser?.uid).toBe('ada');
      expect(listener).toHaveBeenLastCalledWith(user);

      await authService.signOut();
      expect(authService.currentUser).toBeNull();
      expect(listener).toHaveBeenLastCalledWith(null);
    });

    it.each([
      ['nobody@example.com', 'password123', 'auth/user-not-found'],
      ['ada@example.com', 'wrong', 'auth/invalid-credential'],
      ['disabled@example.com', 'password123', 'auth/user-disabled'],
    ])('rejects %s / %s with %s', async (email, password, code) => {
      const { authService } = createMockDataServices();
      await expect(authService.signInWithEmailAndPassword(email, password)).rejects.toMatchObject({
        code,
      });
      expect(authService.currentUser).toBeNull();
    });

    it('rejects sign-up with an existing email or a weak password', async () => {
      const { authService } = createMockDataServices();
      await expect(
        authService.createUserWithEmailAndPassword('grace@example.com', 'password123'),
      ).rejects.toMatchObject({ code: 'auth/email-already-in-use' });
      await expect(
        authService.createUserWithEmailAndPassword('new@example.com', '123'),
      ).rejects.toMatchObject({ code: 'auth/weak-password' });
    });

    it('signs up a new user without saving them', async () => {
      const { authService, userService } = createMockDataServices();
      const { user } = await authService.createUserWithEmailAndPassword(
        'new@example.com',
        'password123',
      );
      expect(authService.currentUser).toBe(user);
      await expect(userService.getUserProfile(user.uid)).resolves.toBeNull();
    });
  });

  describe('chat', () => {
    it("lists only the signed-in user's rooms, newest first, named after the other user", async () => {
      const { chatService } = await signedInServices();
      const rooms = await firstValue(chatService.subscribeRooms.bind(chatService));

      expect(rooms.map((room) => room.id)).toEqual([
        'room-ada-grace',
        'room-group-engine',
        'room-ada-alan',
        'room-channel-announcements',
        'room-ada-katherine',
      ]);
      expect(rooms[0]).toMatchObject({ type: 'direct', name: 'Grace Hopper' });
      expect(rooms.map((room) => room.type)).toEqual(
        expect.arrayContaining(['direct', 'group', 'channel']),
      );
    });

    it('errors when signed out', async () => {
      const { chatService } = createMockDataServices();
      await expect(firstValue(chatService.subscribeRooms.bind(chatService))).rejects.toThrow(
        'User not authenticated',
      );
    });

    it('maps text and non-text messages, newest first', async () => {
      const { chatService } = await signedInServices();
      const rooms = await firstValue(chatService.subscribeRooms.bind(chatService));
      const room = rooms.find(({ id }) => id === 'room-ada-grace');
      if (!room) throw new Error('missing room');

      const messages = await firstValue<ChatMessage[]>((observer) =>
        chatService.subscribeMessages(room, observer),
      );

      expect(messages.map((message) => message.type)).toEqual([
        'text',
        'unsupported',
        'text',
        'text',
      ]);
      expect(messages[0]?.author).toMatchObject({ id: 'grace', firstName: 'Grace' });
    });

    it('returns the existing direct room, or an unsaved one', async () => {
      const { chatService } = await signedInServices();
      await expect(chatService.createRoom({ id: 'grace' })).resolves.toMatchObject({
        id: 'room-ada-grace',
      });
      await expect(
        chatService.createRoom({ id: 'linus', firstName: 'Linus', lastName: 'Torvalds' }),
      ).resolves.toMatchObject({ type: 'direct', name: 'Linus Torvalds' });
    });

    it('lists every user except the signed-in one', async () => {
      const { chatService } = await signedInServices();
      const users = await firstValue(chatService.subscribeUsers.bind(chatService));
      expect(users.map((user) => user.id)).not.toContain('ada');
      expect(users.map((user) => user.role)).toEqual(
        expect.arrayContaining(['admin', 'agent', 'moderator', 'user']),
      );
    });
  });

  describe('users', () => {
    it('parses every profile, applying defaults', async () => {
      const { userService } = createMockDataServices();
      await expect(userService.getUserProfile('ada')).resolves.toMatchObject({
        userName: 'ada_lovelace',
        locationSharing: 'whileUsing',
      });
      await expect(userService.getUserProfile('katherine')).resolves.toMatchObject({
        groups: [],
        snapCount: 0,
        locationSharing: 'off',
      });
      await expect(userService.getUserProfile('legacy-user')).resolves.toBeNull();
    });

    it('dedupes legacy auto-id friend documents', async () => {
      const { userService } = createMockDataServices();
      const friends = await firstValue<{ id: string }[]>((observer) =>
        userService.subscribeFriends('ada', observer),
      );
      expect(friends.map((friend) => friend.id).sort()).toEqual([
        'alan',
        'grace',
        'katherine',
        'margaret',
      ]);
    });

    it('reads following and chat users', async () => {
      const { userService } = createMockDataServices();
      await expect(
        firstValue<string[]>((observer) => userService.subscribeFollowing('ada', observer)),
      ).resolves.toEqual(['grace', 'linus']);
      await expect(userService.countFollowing('ada')).resolves.toBe(2);
      await expect(userService.countFollowing('nobody')).resolves.toBe(0);
      await expect(userService.getChatUser('nobody')).resolves.toBeNull();
    });
  });

  describe('stories', () => {
    it('includes shared stories and "everyone" stories from followed owners only', async () => {
      const { storyService } = createMockDataServices();
      const feed = await firstValue<{ id: string; createdAt?: number }[]>((observer) =>
        storyService.subscribeFeed('ada', ['grace', 'alan', 'linus'], observer),
      );
      const ids = feed.map((story) => story.id);

      expect(ids).toEqual(
        expect.arrayContaining(['story-ada-1', 'story-grace-1', 'story-linus-1']),
      );
      expect(ids).not.toContain('story-linus-2');
      const times = feed.map((story) => story.createdAt ?? 0);
      expect(times).toEqual([...times].sort((a, b) => b - a));
    });

    it("lists the user's own stories", async () => {
      const { storyService } = createMockDataServices();
      const own = await firstValue<{ ownerId: string }[]>((observer) =>
        storyService.subscribeOwnStories('ada', observer),
      );
      expect(own).toHaveLength(2);
      expect(own.every((story) => story.ownerId === 'ada')).toBe(true);
    });
  });

  describe('locations, snaps, memories, content', () => {
    it("shows friends' locations visible to the user, excluding their own", async () => {
      const { locationService } = createMockDataServices();
      const friends = await firstValue<{ id: string }[]>((observer) =>
        locationService.subscribeFriendLocations('ada', observer),
      );
      expect(friends.map((friend) => friend.id).sort()).toEqual([
        'alan',
        'grace',
        'katherine',
        'margaret',
      ]);
    });

    it('lists received snaps and resolves their photo', async () => {
      const { snapService } = createMockDataServices();
      const snaps = await firstValue<{ id: string }[]>((observer) =>
        snapService.subscribeReceivedSnaps('ada', observer),
      );
      expect(snaps.map((snap) => snap.id)).toEqual([
        'batchGrace1_ada',
        'batchAlan1_ada',
        'batchMargaret1_ada',
      ]);

      await expect(snapService.getSnap('batchGrace1_ada')).resolves.toMatchObject({
        snap: { senderId: 'grace' },
        imageUrl: expect.stringContaining('https://'),
      });
      await expect(snapService.getSnap('missing')).resolves.toBeNull();
    });

    it('rejects a snap with no recipients other than the sender', async () => {
      const { snapService } = createMockDataServices();
      await expect(
        snapService.sendSnap({
          sender: { id: 'ada', name: 'Ada' },
          recipientIds: ['ada'],
          localUri: 'file://photo.jpg',
        }),
      ).rejects.toThrow('Choose at least one friend.');
    });

    it('lists memories newest first', async () => {
      const { memoryService } = createMockDataServices();
      const memories = await firstValue<{ id: string }[]>((observer) =>
        memoryService.subscribeMemories('ada', observer),
      );
      expect(memories.map((memory) => memory.id)).toEqual([
        'memory-ada-1',
        'memory-ada-2',
        'memory-ada-3',
      ]);
    });

    it('returns news newest first and subscriptions in order', async () => {
      const { contentService } = createMockDataServices();
      const news = await contentService.getNews();
      expect(news[0]?.id).toBe('news-1');
      expect(news.find((item) => item.id === 'news-4')).toMatchObject({ summary: '', content: '' });

      const subscriptions = await contentService.getSubscriptions();
      expect(subscriptions.map((subscription) => subscription.order)).toEqual([1, 2, 3, 4, 5]);
    });

    it('rejects a missing storage file with a Firebase code', async () => {
      const { mediaService } = createMockDataServices();
      await expect(mediaService.getDownloadUrl('nope.jpg')).rejects.toMatchObject({
        code: 'storage/object-not-found',
      });
    });
  });

  it('cancels delivery when unsubscribed before the first value', async () => {
    const { userService } = createMockDataServices();
    const next = jest.fn();
    const unsubscribe = userService.subscribeFriends('ada', { next, error: jest.fn() });
    unsubscribe();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(next).not.toHaveBeenCalled();
  });
});
