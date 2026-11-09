import type { User } from '@react-native-firebase/auth';
import { act, renderHook } from '@testing-library/react-native';

import { useAuthState, useSignedInUser } from '@/providers/AuthStateProvider';
import { createMockServices, fakeUser } from '@test/mock-services';
import { renderHookWithProviders } from '@test/render';

describe('useAuthState', () => {
  it('is loading until Firebase reports the auth state', async () => {
    const services = createMockServices();
    let listener!: (user: User | null) => void;
    services.authService.onAuthStateChanged.mockImplementation((next) => {
      listener = next;
      return jest.fn();
    });

    const { result } = await renderHookWithProviders(useAuthState, { services });
    expect(result.current).toEqual({ user: null, isLoading: true });

    const user = fakeUser();
    await act(() => listener(user));
    expect(result.current).toEqual({ user, isLoading: false });
  });

  it('reports a signed-out user as null', async () => {
    const { result } = await renderHookWithProviders(useAuthState, {
      services: createMockServices(null),
    });
    expect(result.current).toEqual({ user: null, isLoading: false });
  });

  it('unsubscribes from auth changes on unmount', async () => {
    const services = createMockServices();
    const unsubscribe = jest.fn();
    services.authService.onAuthStateChanged.mockReturnValue(unsubscribe);

    const { unmount } = await renderHookWithProviders(useAuthState, { services });
    await unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});

describe('useSignedInUser', () => {
  it('returns the signed-in user', async () => {
    const user = fakeUser();
    const { result } = await renderHookWithProviders(useSignedInUser, { user });
    expect(result.current).toBe(user);
  });

  it('throws outside the signed-in screens', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderHook(useSignedInUser)).rejects.toThrow(/SignedInUserProvider/);
  });
});
