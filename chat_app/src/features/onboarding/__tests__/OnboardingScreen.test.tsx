import type { UserCredential } from '@react-native-firebase/auth';
import { fireEvent, screen } from '@testing-library/react-native';

import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';
import { createMockServices, fakeUser } from '@test/mock-services';
import { renderWithProviders } from '@test/render';

describe('OnboardingScreen', () => {
  it('shows the Sign in, Register, and Forgot Password buttons', async () => {
    await renderWithProviders(<OnboardingScreen />);
    expect(screen.getByTestId('open-login')).toHaveTextContent('Sign in');
    expect(screen.getByTestId('open-register')).toHaveTextContent('Register');
    expect(screen.getByTestId('open-reset-password')).toHaveTextContent('Forgot Password');
  });

  it('opens the register form', async () => {
    await renderWithProviders(<OnboardingScreen />);
    await fireEvent.press(screen.getByTestId('open-register'));
    expect(screen.getByTestId('register-first-name')).toBeOnTheScreen();
  });

  it('opens the reset password form', async () => {
    await renderWithProviders(<OnboardingScreen />);
    await fireEvent.press(screen.getByTestId('open-reset-password'));
    expect(screen.getByTestId('reset-email')).toBeOnTheScreen();
  });
});

describe('LoginForm (in the Sign in sheet)', () => {
  async function openLogin() {
    const services = createMockServices();
    services.userService.getUserProfile.mockResolvedValue({
      userName: 'a',
      first: 'A',
      last: 'B',
      groups: [],
      snapCount: 0,
      locationSharing: 'off',
    });
    await renderWithProviders(<OnboardingScreen />, { services });
    await fireEvent.press(screen.getByTestId('open-login'));
    return services;
  }

  it('validates empty fields without calling Firebase', async () => {
    const services = await openLogin();
    await fireEvent.press(screen.getByTestId('login-submit'));
    expect(screen.getByText('Please enter a valid email')).toBeOnTheScreen();
    expect(screen.getByText('Password cannot be empty')).toBeOnTheScreen();
    expect(services.authService.signInWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it('signs in with the entered credentials', async () => {
    const services = await openLogin();
    services.authService.signInWithEmailAndPassword.mockResolvedValue({
      user: fakeUser(),
    } as UserCredential);

    await fireEvent.changeText(screen.getByTestId('login-email'), ' ada@example.com ');
    await fireEvent.changeText(screen.getByTestId('login-password'), 'secret');
    await fireEvent.press(screen.getByTestId('login-submit'));

    expect(services.authService.signInWithEmailAndPassword).toHaveBeenCalledWith(
      'ada@example.com',
      'secret',
    );
  });

  it('shows a readable message when sign-in fails', async () => {
    const services = await openLogin();
    services.authService.signInWithEmailAndPassword.mockRejectedValue({
      code: 'auth/invalid-credential',
    });

    await fireEvent.changeText(screen.getByTestId('login-email'), 'ada@example.com');
    await fireEvent.changeText(screen.getByTestId('login-password'), 'wrong');
    await fireEvent.press(screen.getByTestId('login-submit'));

    expect(await screen.findByText('Incorrect email or password.')).toBeOnTheScreen();
  });
});
