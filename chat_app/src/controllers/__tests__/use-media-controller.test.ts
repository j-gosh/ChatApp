import { useMediaController } from '@/controllers/use-media-controller';
import { createMockServices, fakeUser } from '@test/mock-services';
import { renderHookWithProviders } from '@test/render';

const user = fakeUser({ photoURL: 'https://img/old.jpg' });

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

async function setup() {
  const services = createMockServices(user);
  services.mediaService.uploadImage.mockResolvedValue({
    storagePath: 'avatars/user-1/2.jpg',
    url: 'https://img/new.jpg',
  });
  const { result } = await renderHookWithProviders(useMediaController, { services, user });
  return { services, controller: result.current };
}

describe('useMediaController.updateAvatar', () => {
  it('stores the new photo, then deletes the previous one', async () => {
    const { services, controller } = await setup();
    await controller.updateAvatar('file:///photo.jpg');

    expect(services.userService.setAvatarUrl).toHaveBeenCalledWith('user-1', 'https://img/new.jpg');
    expect(services.authService.updatePhotoUrl).toHaveBeenCalledWith(user, 'https://img/new.jpg');
    expect(services.mediaService.deleteFile).toHaveBeenCalledWith('https://img/old.jpg');
  });

  it('deletes the upload and keeps the old photo if saving fails', async () => {
    const { services, controller } = await setup();
    services.userService.setAvatarUrl.mockRejectedValue(new Error('permission-denied'));

    await expect(controller.updateAvatar('file:///photo.jpg')).rejects.toThrow('permission-denied');
    expect(services.mediaService.deleteFile).toHaveBeenCalledWith('avatars/user-1/2.jpg');
    expect(services.mediaService.deleteFile).not.toHaveBeenCalledWith('https://img/old.jpg');
  });
});

describe('useMediaController sharing', () => {
  it('posts a story as the signed-in user with a trimmed caption', async () => {
    const { services, controller } = await setup();
    await controller.postStory('file:///photo.jpg', '  Hello  ', 'everyone');

    expect(services.storyService.postStory).toHaveBeenCalledWith({
      owner: { id: 'user-1', name: 'Ada Lovelace', imageUrl: 'https://img/old.jpg' },
      localUri: 'file:///photo.jpg',
      caption: 'Hello',
      visibility: 'everyone',
    });
  });

  it('sends a snap from the signed-in user', async () => {
    const { services, controller } = await setup();
    await controller.sendSnap('file:///photo.jpg', ['grace']);

    expect(services.snapService.sendSnap).toHaveBeenCalledWith({
      sender: { id: 'user-1', name: 'Ada Lovelace' },
      recipientIds: ['grace'],
      localUri: 'file:///photo.jpg',
    });
  });
});
