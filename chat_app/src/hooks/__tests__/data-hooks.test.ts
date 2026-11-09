import { act, waitFor } from '@testing-library/react-native';

import { useAvailableUsers } from '@/hooks/chat/use-available-users';
import { useChatMessages } from '@/hooks/chat/use-chat-messages';
import { useChatRooms } from '@/hooks/chat/use-chat-rooms';
import { useStoryFeed } from '@/hooks/stories/use-story-feed';
import { useUserFriends } from '@/hooks/user/use-user-friends';
import { useUserProfile } from '@/hooks/user/use-user-profile';
import type { ChatMessage, ChatUser, Room } from '@/models/chat';
import type { UserProfile } from '@/models/user-profile';
import type { Observer } from '@/services/observer';
import { createMockServices, fakeUser } from '@test/mock-services';
import { renderHookWithProviders } from '@test/render';

const user = fakeUser();
const room: Room = {
  id: 'room-1',
  type: 'direct',
  users: [{ id: user.uid }, { id: 'u2' }],
  name: 'Grace',
};

beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));

describe('useChatRooms', () => {
  it('emits the rooms from chatService.subscribeRooms', async () => {
    const services = createMockServices(user);
    let observer!: Observer<Room[]>;
    services.chatService.subscribeRooms.mockImplementation((next) => {
      observer = next;
      return jest.fn();
    });

    const { result } = await renderHookWithProviders(useChatRooms, { services, user });
    await act(() => observer.next([room]));
    expect(result.current.data).toEqual([room]);
  });

  it('emits an error when the subscription fails', async () => {
    const services = createMockServices(user);
    services.chatService.subscribeRooms.mockImplementation((observer) => {
      observer.error(new Error('permission-denied'));
      return jest.fn();
    });

    const { result } = await renderHookWithProviders(useChatRooms, { services, user });
    expect(result.current.error).toEqual(new Error('permission-denied'));
  });
});

describe('useChatMessages', () => {
  it('emits messages for the given room', async () => {
    const services = createMockServices(user);
    const messages: ChatMessage[] = [{ id: 'm1', type: 'text', text: 'hi', author: { id: 'u2' } }];
    services.chatService.subscribeMessages.mockImplementation((_room, observer) => {
      observer.next(messages);
      return jest.fn();
    });

    const { result } = await renderHookWithProviders(() => useChatMessages(room), {
      services,
      user,
    });
    expect(services.chatService.subscribeMessages).toHaveBeenCalledWith(room, expect.anything());
    expect(result.current.data).toEqual(messages);
  });

  it('does not subscribe without a room', async () => {
    const services = createMockServices(user);
    const { result } = await renderHookWithProviders(() => useChatMessages(null), {
      services,
      user,
    });
    expect(services.chatService.subscribeMessages).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });
});

describe('useAvailableUsers', () => {
  it('emits the users from chatService.subscribeUsers', async () => {
    const services = createMockServices(user);
    const users: ChatUser[] = [{ id: 'u2', firstName: 'Grace' }];
    services.chatService.subscribeUsers.mockImplementation((observer) => {
      observer.next(users);
      return jest.fn();
    });

    const { result } = await renderHookWithProviders(useAvailableUsers, { services, user });
    expect(result.current.data).toEqual(users);
  });
});

describe('useUserFriends', () => {
  it('subscribes to the given user’s friends', async () => {
    const services = createMockServices(user);
    services.userService.subscribeFriends.mockImplementation((_userId, observer) => {
      observer.next([{ id: 'u2' }]);
      return jest.fn();
    });

    const { result } = await renderHookWithProviders(() => useUserFriends('user-1'), {
      services,
      user,
    });
    expect(services.userService.subscribeFriends).toHaveBeenCalledWith('user-1', expect.anything());
    expect(result.current.data).toEqual([{ id: 'u2' }]);
  });
});

describe('useUserProfile', () => {
  it('loads the signed-in user’s profile', async () => {
    const services = createMockServices(user);
    const profile: UserProfile = {
      userName: 'ada_lovelace',
      first: 'Ada',
      last: 'Lovelace',
      groups: [],
      snapCount: 0,
      locationSharing: 'off',
    };
    services.userService.getUserProfile.mockResolvedValue(profile);

    const { result } = await renderHookWithProviders(useUserProfile, { services, user });
    await waitFor(() => expect(result.current.data).toEqual(profile));
    expect(services.userService.getUserProfile).toHaveBeenCalledWith('user-1');
  });

  it('propagates service errors', async () => {
    const services = createMockServices(user);
    services.userService.getUserProfile.mockRejectedValue(new Error('unavailable'));

    const { result } = await renderHookWithProviders(useUserProfile, { services, user });
    await waitFor(() => expect(result.current.error).toEqual(new Error('unavailable')));
  });
});

describe('useStoryFeed', () => {
  it('subscribes with followed users and friends, then groups the stories by owner', async () => {
    const services = createMockServices(user);
    services.userService.subscribeFollowing.mockImplementation((_id, observer) => {
      observer.next(['alan', 'grace']);
      return jest.fn();
    });
    services.userService.subscribeFriends.mockImplementation((_id, observer) => {
      observer.next([{ id: 'grace' }, { id: 'katherine' }]);
      return jest.fn();
    });
    services.storyService.subscribeFeed.mockImplementation((_uid, _ownerIds, observer) => {
      observer.next([
        {
          id: 's1',
          ownerId: 'grace',
          ownerName: 'Grace',
          imageUrl: 'https://img/s1.jpg',
          storagePath: 'stories/grace/s1/image.jpg',
          caption: '',
          visibility: 'everyone',
          createdAt: 1,
        },
      ]);
      return jest.fn();
    });

    const { result } = await renderHookWithProviders(useStoryFeed, { services, user });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(services.storyService.subscribeFeed).toHaveBeenCalledWith(
      'user-1',
      ['alan', 'grace', 'katherine'],
      expect.anything(),
    );
    expect(result.current.data).toEqual([
      expect.objectContaining({ userId: 'grace', displayName: 'Grace' }),
    ]);
  });

  it('waits for the following and friends lists before subscribing', async () => {
    const services = createMockServices(user);
    const { result } = await renderHookWithProviders(useStoryFeed, { services, user });

    expect(result.current.isLoading).toBe(true);
    expect(services.storyService.subscribeFeed).not.toHaveBeenCalled();
  });
});
