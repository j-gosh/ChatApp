import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { SelectedProfileScreen } from '@/features/profile/SelectedProfileScreen';
import { createMockServices, fakeUser } from '@test/mock-services';
import { renderWithProviders } from '@test/render';

const mockParams = { userId: 'grace' };
jest.mock('expo-router', () => ({ useLocalSearchParams: () => mockParams }));

const user = fakeUser();

async function renderProfile(following: string[] = []) {
  const services = createMockServices(user);
  services.userService.subscribeChatUser.mockImplementation((_id, observer) => {
    observer.next({ id: 'grace', firstName: 'Grace', lastName: 'Hopper' });
    return jest.fn();
  });
  services.userService.getUserProfile.mockResolvedValue({
    userName: 'grace_h',
    first: 'Grace',
    last: 'Hopper',
    groups: [],
    snapCount: 4,
    locationSharing: 'off',
  });
  services.userService.countFollowing.mockResolvedValue(9);
  services.userService.subscribeFollowing.mockImplementation((_id, observer) => {
    observer.next(following);
    return jest.fn();
  });
  await renderWithProviders(<SelectedProfileScreen />, { services, user });
  return services;
}

describe('SelectedProfileScreen', () => {
  it("shows the user's name and stats from Firestore", async () => {
    await renderProfile();
    expect(screen.getByText('Grace Hopper')).toBeOnTheScreen();
    expect(await screen.findByText('@grace_h')).toBeOnTheScreen();
    expect(screen.getByText('4')).toBeOnTheScreen();
    expect(await screen.findByText('9')).toBeOnTheScreen();
  });

  it('follows the user', async () => {
    const services = await renderProfile();
    await fireEvent.press(screen.getByText('Follow'));
    await waitFor(() =>
      expect(services.userService.follow).toHaveBeenCalledWith('user-1', 'grace'),
    );
  });

  it('unfollows a user already followed', async () => {
    const services = await renderProfile(['grace']);
    await fireEvent.press(screen.getByText('Unfollow'));
    await waitFor(() =>
      expect(services.userService.unfollow).toHaveBeenCalledWith('user-1', 'grace'),
    );
  });

  it('says so when the user does not exist', async () => {
    const services = createMockServices(user);
    services.userService.subscribeChatUser.mockImplementation((_id, observer) => {
      observer.next(null);
      return jest.fn();
    });
    await renderWithProviders(<SelectedProfileScreen />, { services, user });
    expect(screen.getByText("This user doesn't exist.")).toBeOnTheScreen();
  });
});
