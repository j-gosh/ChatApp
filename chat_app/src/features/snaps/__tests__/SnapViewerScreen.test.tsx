import { fireEvent, screen } from '@testing-library/react-native';

import { SnapViewerScreen } from '@/features/snaps/SnapViewerScreen';
import { createMockServices, fakeUser } from '@test/mock-services';
import { renderWithProviders } from '@test/render';

jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: () => ({ snapId: 'b1_user-1' }),
}));

const user = fakeUser();
const snap = {
  id: 'b1_user-1',
  batchId: 'b1',
  senderId: 'grace',
  senderName: 'Grace Hopper',
  recipientId: 'user-1',
  storagePath: 'snaps/grace/b1/image.jpg',
};

beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));

describe('SnapViewerScreen', () => {
  it('consumes the snap once its photo has loaded', async () => {
    const services = createMockServices(user);
    services.snapService.getSnap.mockResolvedValue({ snap, imageUrl: 'https://img/snap.jpg' });
    await renderWithProviders(<SnapViewerScreen />, { services, user });

    const image = await screen.findByLabelText('Snap from Grace Hopper');
    expect(services.snapService.consumeSnap).not.toHaveBeenCalled();

    // expo-image mutates the event, so each load needs a fresh one.
    const loadEvent = () => ({
      nativeEvent: { cacheType: 'none', source: { url: '', width: 1, height: 1, mediaType: null } },
    });
    await fireEvent(image, 'load', loadEvent());
    await fireEvent(image, 'load', loadEvent());
    expect(services.snapService.consumeSnap).toHaveBeenCalledTimes(1);
    expect(services.snapService.consumeSnap).toHaveBeenCalledWith('b1_user-1');
  });

  it('explains when the snap was already opened', async () => {
    const services = createMockServices(user);
    services.snapService.getSnap.mockResolvedValue(null);
    await renderWithProviders(<SnapViewerScreen />, { services, user });

    expect(await screen.findByText('This snap is no longer available.')).toBeOnTheScreen();
    expect(services.snapService.consumeSnap).not.toHaveBeenCalled();
  });

  it("doesn't consume the snap when it fails to load", async () => {
    const services = createMockServices(user);
    services.snapService.getSnap.mockRejectedValue(new Error('storage/unauthorized'));
    await renderWithProviders(<SnapViewerScreen />, { services, user });

    expect(await screen.findByText("Couldn't load this snap. Try again later.")).toBeOnTheScreen();
    expect(services.snapService.consumeSnap).not.toHaveBeenCalled();
  });
});
