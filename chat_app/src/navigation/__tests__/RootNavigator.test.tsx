import type { User } from '@react-native-firebase/auth';
import { Stack } from 'expo-router';
import { act, renderRouter, screen } from 'expo-router/testing-library';
import { Text } from 'react-native';

import { RootNavigator } from '@/navigation/RootNavigator';
import { createMockServices, fakeUser } from '@test/mock-services';
import { createTestWrapper } from '@test/render';

type AuthListener = (user: User | null) => void;

/** Renders the real root navigator over placeholder screens, with controllable auth state. */
async function renderApp(initialUrl: string, initialUser: User | null | 'loading') {
  const services = createMockServices();
  let emitAuth: AuthListener = () => {};
  services.authService.onAuthStateChanged.mockImplementation((listener) => {
    emitAuth = listener;
    if (initialUser !== 'loading') listener(initialUser);
    return jest.fn();
  });
  const { Wrapper } = createTestWrapper({ services });

  await renderRouter(
    {
      _layout: () => (
        <Wrapper>
          <RootNavigator />
        </Wrapper>
      ),
      '(app)/_layout': () => <Stack />,
      '(app)/index': () => <Text>Home</Text>,
      '(app)/messages': () => <Text>Messages</Text>,
      onboarding: () => <Text>Onboarding</Text>,
    },
    { initialUrl },
  );

  return { setAuth: (user: User | null) => act(() => emitAuth(user)) };
}

describe('RootNavigator auth guard', () => {
  it('sends signed-out users at "/" to onboarding', async () => {
    await renderApp('/', null);
    expect(screen).toHavePathname('/onboarding');
    expect(screen.getByText('Onboarding')).toBeOnTheScreen();
  });

  it('keeps signed-out users on onboarding', async () => {
    await renderApp('/onboarding', null);
    expect(screen).toHavePathname('/onboarding');
  });

  it('sends signed-out users away from signed-in screens', async () => {
    await renderApp('/messages', null);
    expect(screen).toHavePathname('/onboarding');
  });

  it('sends signed-in users at onboarding to home', async () => {
    await renderApp('/onboarding', fakeUser());
    expect(screen).toHavePathname('/');
    expect(screen.getByText('Home')).toBeOnTheScreen();
  });

  it('lets signed-in users open signed-in screens', async () => {
    await renderApp('/messages', fakeUser());
    expect(screen).toHavePathname('/messages');
  });

  it('renders nothing while auth state is loading', async () => {
    await renderApp('/', 'loading');
    expect(screen.queryByText('Home')).toBeNull();
    expect(screen.queryByText('Onboarding')).toBeNull();
  });

  it('redirects to onboarding on sign-out and home on sign-in', async () => {
    const { setAuth } = await renderApp('/', fakeUser());
    expect(screen).toHavePathname('/');

    await setAuth(null);
    expect(screen).toHavePathname('/onboarding');

    await setAuth(fakeUser());
    expect(screen).toHavePathname('/');
  });
});
