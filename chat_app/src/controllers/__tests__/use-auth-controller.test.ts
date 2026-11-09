import type { UserCredential } from '@react-native-firebase/auth';

import { ProfileSetupError, useAuthController } from '@/controllers/use-auth-controller';
import type { UserProfile } from '@/models/user-profile';
import { useChatStore } from '@/stores/chat-store';
import { createMockServices, fakeUser } from '@test/mock-services';
import { renderHookWithProviders } from '@test/render';

const user = fakeUser({ uid: 'new-user', displayName: 'Ada Lovelace' });
const credential = { user } as UserCredential;
const profile: UserProfile = {
  userName: 'ada_lovelace',
  first: 'Ada',
  last: 'Lovelace',
  groups: [],
  snapCount: 0,
  locationSharing: 'off',
};

beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));

async function setup() {
  const services = createMockServices();
  services.authService.signInWithEmailAndPassword.mockResolvedValue(credential);
  services.authService.createUserWithEmailAndPassword.mockResolvedValue(credential);
  const { result } = await renderHookWithProviders(useAuthController, { services });
  return { services, controller: result.current };
}

describe('signIn', () => {
  it('signs in with the given credentials', async () => {
    const { services, controller } = await setup();
    services.userService.getUserProfile.mockResolvedValue(profile);

    await controller.signIn('ada@example.com', 'secret');
    expect(services.authService.signInWithEmailAndPassword).toHaveBeenCalledWith(
      'ada@example.com',
      'secret',
    );
    expect(services.userService.saveUserProfile).not.toHaveBeenCalled();
  });

  it('propagates sign-in errors', async () => {
    const { services, controller } = await setup();
    services.authService.signInWithEmailAndPassword.mockRejectedValue({
      code: 'auth/invalid-credential',
    });
    await expect(controller.signIn('a', 'b')).rejects.toEqual({ code: 'auth/invalid-credential' });
  });

  it('recreates a missing profile from the account name', async () => {
    const { services, controller } = await setup();
    services.userService.getUserProfile.mockResolvedValue(null);

    await controller.signIn('ada@example.com', 'secret');
    expect(services.chatService.createUserInFirestore).toHaveBeenCalledWith({
      id: 'new-user',
      firstName: 'Ada',
      lastName: 'Lovelace',
    });
    expect(services.userService.saveUserProfile).toHaveBeenCalledWith(
      'new-user',
      'Ada_Lovelace',
      'Ada',
      'Lovelace',
    );
  });

  it('still signs in when repairing the profile fails', async () => {
    const { services, controller } = await setup();
    services.userService.getUserProfile.mockRejectedValue(new Error('offline'));
    await expect(controller.signIn('a', 'b')).resolves.toBeUndefined();
  });
});

describe('signUp', () => {
  const input = {
    email: 'ada@example.com',
    password: 'secret123',
    firstName: 'Ada',
    lastName: 'Lovelace',
  };

  it('creates the account, names it, and creates the chat user and profile', async () => {
    const { services, controller } = await setup();
    await controller.signUp({ ...input, userName: 'Ada_Lovelace' });

    expect(services.authService.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      'ada@example.com',
      'secret123',
    );
    expect(services.authService.updateDisplayName).toHaveBeenCalledWith(user, 'Ada Lovelace');
    expect(services.chatService.createUserInFirestore).toHaveBeenCalledWith({
      id: 'new-user',
      firstName: 'Ada',
      lastName: 'Lovelace',
    });
    expect(services.userService.saveUserProfile).toHaveBeenCalledWith(
      'new-user',
      'Ada_Lovelace',
      'Ada',
      'Lovelace',
    );
  });

  it('does not save a profile without a user name', async () => {
    const { services, controller } = await setup();
    await controller.signUp(input);
    expect(services.userService.saveUserProfile).not.toHaveBeenCalled();
  });

  it('propagates account creation errors unchanged', async () => {
    const { services, controller } = await setup();
    services.authService.createUserWithEmailAndPassword.mockRejectedValue({
      code: 'auth/email-already-in-use',
    });
    await expect(controller.signUp(input)).rejects.toEqual({ code: 'auth/email-already-in-use' });
  });

  it('throws ProfileSetupError when the account exists but its documents fail', async () => {
    const { services, controller } = await setup();
    services.chatService.createUserInFirestore.mockRejectedValue(new Error('offline'));
    await expect(controller.signUp(input)).rejects.toBeInstanceOf(ProfileSetupError);
  });
});

describe('signOut', () => {
  it('signs out and clears the selected room', async () => {
    const { services, controller } = await setup();
    useChatStore.getState().selectRoom({ id: 'r', type: 'direct', users: [] });

    await controller.signOut();
    expect(services.authService.signOut).toHaveBeenCalled();
    expect(useChatStore.getState().selectedRoom).toBeNull();
  });

  it('stops sharing the location of the signed-in user first', async () => {
    const services = createMockServices(user);
    const { result } = await renderHookWithProviders(useAuthController, { services });

    await result.current.signOut();
    expect(services.locationService.stopSharing).toHaveBeenCalledWith('new-user');
    expect(services.authService.signOut).toHaveBeenCalled();
  });

  it('still signs out when the shared location cannot be removed', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const services = createMockServices(user);
    services.locationService.stopSharing.mockRejectedValue(new Error('offline'));
    const { result } = await renderHookWithProviders(useAuthController, { services });

    await result.current.signOut();
    expect(services.authService.signOut).toHaveBeenCalled();
  });
});

describe('sendPasswordReset', () => {
  it('sends the reset email', async () => {
    const { services, controller } = await setup();
    await controller.sendPasswordReset('ada@example.com');
    expect(services.authService.sendPasswordResetEmail).toHaveBeenCalledWith('ada@example.com');
  });
});
