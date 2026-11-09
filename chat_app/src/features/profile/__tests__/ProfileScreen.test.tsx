import { act, fireEvent, screen } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Alert } from 'react-native';

import { ProfileScreen } from '@/features/profile/ProfileScreen';
import type { Snap } from '@/models/snap';
import type { StoryPost } from '@/models/story';
import { createMockServices, fakeUser } from '@test/mock-services';
import { renderWithProviders } from '@test/render';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  // Render the screen's header actions inline so they can be pressed.
  Stack: {
    Screen: ({ options }: { options?: { headerRight?: () => React.ReactNode } }) =>
      options?.headerRight?.() ?? null,
  },
}));

const user = fakeUser();
const profile = {
  userName: 'Ada_Lovelace',
  first: 'Ada',
  last: 'Lovelace',
  groups: [],
  snapCount: 7,
  locationSharing: 'off' as const,
};
const snap: Snap = {
  id: 'b1_user-1',
  batchId: 'b1',
  senderId: 'u2',
  senderName: 'Grace Hopper',
  recipientId: 'user-1',
  storagePath: 'snaps/u2/b1/image.jpg',
};
const story: StoryPost = {
  id: 's1',
  ownerId: 'user-1',
  ownerName: 'Ada Lovelace',
  imageUrl: 'https://img/s1.jpg',
  storagePath: 'stories/user-1/s1/image.jpg',
  caption: 'Beach day',
  visibility: 'friends',
};

beforeEach(() => jest.clearAllMocks());

async function renderProfile(profileResult: typeof profile | null = profile) {
  const services = createMockServices(user);
  services.userService.getUserProfile.mockResolvedValue(profileResult);
  services.userService.countFollowing.mockResolvedValue(12);
  services.userService.subscribeFriends.mockImplementation((_userId, observer) => {
    observer.next([{ id: 'u2' }, { id: 'u3' }]);
    return jest.fn();
  });
  services.snapService.subscribeReceivedSnaps.mockImplementation((_userId, observer) => {
    observer.next([snap]);
    return jest.fn();
  });
  services.storyService.subscribeOwnStories.mockImplementation((_userId, observer) => {
    observer.next([story]);
    return jest.fn();
  });
  services.memoryService.subscribeMemories.mockImplementation((_userId, observer) => {
    observer.next([]);
    return jest.fn();
  });
  await renderWithProviders(<ProfileScreen />, { services, user });
  return services;
}

describe('ProfileScreen', () => {
  it('shows the user name and id', async () => {
    await renderProfile();
    expect(await screen.findByText('Ada_Lovelace')).toBeOnTheScreen();
    expect(screen.getByText('user-1')).toBeOnTheScreen();
  });

  it('shows real Snap Totals, Friends, and Following counts', async () => {
    await renderProfile();
    expect(await screen.findByText('7')).toBeOnTheScreen();
    expect(screen.getByText('2')).toBeOnTheScreen();
    expect(await screen.findByText('12')).toBeOnTheScreen();
  });

  it('opens the friends list from the Friends stat', async () => {
    await renderProfile();
    await fireEvent.press(screen.getByText('Friends'));
    expect(router.push).toHaveBeenCalledWith('/friends');
  });

  it('opens settings from the header', async () => {
    await renderProfile();
    await fireEvent.press(screen.getByLabelText('Settings'));
    expect(router.push).toHaveBeenCalledWith('/settings');
  });

  it('starts on Snaps and opens a received snap', async () => {
    await renderProfile();
    await fireEvent.press(screen.getByText('Snap from Grace Hopper'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/snap/[snapId]',
      params: { snapId: 'b1_user-1' },
    });
  });

  it('shows own stories and lets the owner make one public', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const services = await renderProfile();
    await fireEvent.press(screen.getByText('Stories'));
    await fireEvent.press(screen.getByLabelText('Beach day'));

    const buttons = alert.mock.calls[0]?.[2] ?? [];
    await act(async () =>
      buttons.find((button) => button.text === 'Show to everyone')?.onPress?.(),
    );
    expect(services.storyService.setVisibility).toHaveBeenCalledWith('s1', 'everyone');
  });

  it('shows an empty memories tab', async () => {
    await renderProfile();
    await fireEvent.press(screen.getByText('Memories'));
    expect(screen.getByText('No memories yet. Save one from the camera.')).toBeOnTheScreen();
  });

  it('uploads a photo chosen from the library as the new avatar', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///photo.jpg' }],
    } as ImagePicker.ImagePickerResult);
    const services = await renderProfile();
    services.mediaService.uploadImage.mockResolvedValue({
      storagePath: 'avatars/user-1/1.jpg',
      url: 'https://img/avatar.jpg',
    });

    await fireEvent.press(screen.getByLabelText('Change profile photo'));
    const buttons = alert.mock.calls[0]?.[2] ?? [];
    await act(async () => buttons.find((button) => button.text === 'Choose photo')?.onPress?.());

    expect(services.mediaService.uploadImage).toHaveBeenCalledWith(
      'file:///photo.jpg',
      expect.stringMatching(/^avatars\/user-1\//),
    );
    expect(services.userService.setAvatarUrl).toHaveBeenCalledWith(
      'user-1',
      'https://img/avatar.jpg',
    );
  });

  it('does nothing when the photo picker is cancelled', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValue({
      canceled: true,
      assets: null,
    } as ImagePicker.ImagePickerResult);
    const services = await renderProfile();

    await fireEvent.press(screen.getByLabelText('Change profile photo'));
    const buttons = alert.mock.calls[0]?.[2] ?? [];
    await act(async () => buttons.find((button) => button.text === 'Choose photo')?.onPress?.());

    expect(services.mediaService.uploadImage).not.toHaveBeenCalled();
  });

  it('offers to finish setup when the profile is missing', async () => {
    const services = await renderProfile(null);
    await fireEvent.press(await screen.findByText('Finish setup'));
    expect(services.chatService.createUserInFirestore).toHaveBeenCalledWith({
      id: 'user-1',
      firstName: 'Ada',
      lastName: 'Lovelace',
    });
  });
});
