import type { User } from '@react-native-firebase/auth';

import type { Services } from '@/providers/ServicesProvider';
import type { AuthService } from '@/services/auth-service';
import type { ChatService } from '@/services/chat-service';
import type { ContentService } from '@/services/content-service';
import type { LocationService } from '@/services/location-service';
import type { MediaService } from '@/services/media-service';
import type { MemoryService } from '@/services/memory-service';
import type { SnapService } from '@/services/snap-service';
import type { StoryService } from '@/services/story-service';
import type { UserService } from '@/services/user-service';
import type { VideoService } from '@/services/video-service';

export interface MockServices extends Services {
  authService: jest.Mocked<AuthService>;
  chatService: jest.Mocked<ChatService>;
  contentService: jest.Mocked<ContentService>;
  locationService: jest.Mocked<LocationService>;
  mediaService: jest.Mocked<MediaService>;
  memoryService: jest.Mocked<MemoryService>;
  snapService: jest.Mocked<SnapService>;
  storyService: jest.Mocked<StoryService>;
  userService: jest.Mocked<UserService>;
  videoService: jest.Mocked<VideoService>;
}

/** A typed `jest.fn` for a service method that returns an unsubscribe function. */
function mockSubscription<F extends (...args: never[]) => () => void>() {
  return jest.fn<ReturnType<F>, Parameters<F>>(() => jest.fn() as ReturnType<F>);
}

/** A Firebase user with just the fields the app reads. */
export function fakeUser(overrides: Partial<User> = {}): User {
  return {
    uid: 'user-1',
    displayName: 'Ada Lovelace',
    email: 'ada@example.com',
    ...overrides,
  } as User;
}

/**
 *
 * Auth reports `user` as the signed-in user; subscriptions never emit unless a test says so.
 */
export function createMockServices(user: User | null = null): MockServices {
  return {
    authService: {
      currentUser: user,
      onAuthStateChanged: jest.fn((listener) => {
        listener(user);
        return jest.fn();
      }),
      signInWithEmailAndPassword: jest.fn(),
      createUserWithEmailAndPassword: jest.fn(),
      updateDisplayName: jest.fn().mockResolvedValue(undefined),
      updatePhotoUrl: jest.fn().mockResolvedValue(undefined),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
      signOut: jest.fn().mockResolvedValue(undefined),
    },
    chatService: {
      subscribeRooms: mockSubscription<ChatService['subscribeRooms']>(),
      subscribeMessages: mockSubscription<ChatService['subscribeMessages']>(),
      subscribeUsers: mockSubscription<ChatService['subscribeUsers']>(),
      sendMessage: jest.fn().mockResolvedValue(undefined),
      createRoom: jest.fn(),
      updateRoom: jest.fn().mockResolvedValue(undefined),
      createUserInFirestore: jest.fn().mockResolvedValue(undefined),
    },
    contentService: {
      getNews: jest.fn().mockResolvedValue([]),
      getSubscriptions: jest.fn().mockResolvedValue([]),
    },
    locationService: {
      subscribeFriendLocations: mockSubscription<LocationService['subscribeFriendLocations']>(),
      shareLocation: jest.fn().mockResolvedValue(undefined),
      stopSharing: jest.fn().mockResolvedValue(undefined),
    },
    mediaService: {
      uploadImage: jest.fn(),
      getDownloadUrl: jest.fn(),
      deleteFile: jest.fn().mockResolvedValue(undefined),
    },
    memoryService: {
      subscribeMemories: mockSubscription<MemoryService['subscribeMemories']>(),
      saveMemory: jest.fn().mockResolvedValue(undefined),
      deleteMemory: jest.fn().mockResolvedValue(undefined),
    },
    snapService: {
      sendSnap: jest.fn().mockResolvedValue(undefined),
      subscribeReceivedSnaps: mockSubscription<SnapService['subscribeReceivedSnaps']>(),
      getSnap: jest.fn().mockResolvedValue(null),
      consumeSnap: jest.fn().mockResolvedValue(undefined),
    },
    storyService: {
      subscribeFeed: mockSubscription<StoryService['subscribeFeed']>(),
      subscribeOwnStories: mockSubscription<StoryService['subscribeOwnStories']>(),
      postStory: jest.fn().mockResolvedValue(undefined),
      setVisibility: jest.fn().mockResolvedValue(undefined),
      deleteStory: jest.fn().mockResolvedValue(undefined),
    },
    userService: {
      getUserProfile: jest.fn().mockResolvedValue(null),
      saveUserProfile: jest.fn().mockResolvedValue(undefined),
      updateUserProfile: jest.fn().mockResolvedValue(undefined),
      subscribeFriends: mockSubscription<UserService['subscribeFriends']>(),
      addUserToFriendsList: jest.fn().mockResolvedValue(undefined),
      getChatUser: jest.fn().mockResolvedValue(null),
      subscribeChatUser: mockSubscription<UserService['subscribeChatUser']>(),
      setAvatarUrl: jest.fn().mockResolvedValue(undefined),
      setLocationSharing: jest.fn().mockResolvedValue(undefined),
      subscribeFollowing: mockSubscription<UserService['subscribeFollowing']>(),
      countFollowing: jest.fn().mockResolvedValue(0),
      follow: jest.fn().mockResolvedValue(undefined),
      unfollow: jest.fn().mockResolvedValue(undefined),
    },
    videoService: {
      getUserToken: jest.fn().mockResolvedValue('token'),
    },
  };
}
