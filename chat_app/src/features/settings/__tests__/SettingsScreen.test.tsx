import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

import { SettingsScreen } from '@/features/settings/SettingsScreen';
import type { UserProfile } from '@/models/user-profile';
import { useSnackbarStore } from '@/stores/snackbar-store';
import { createMockServices, fakeUser } from '@test/mock-services';
import { renderWithProviders } from '@test/render';

const user = fakeUser();
const profile: UserProfile = {
  userName: 'ada',
  first: 'Ada',
  last: 'Lovelace',
  groups: [],
  snapCount: 0,
  locationSharing: 'off',
};
const granted = { granted: true, canAskAgain: true } as Location.LocationPermissionResponse;
const denied = { granted: false, canAskAgain: false } as Location.LocationPermissionResponse;

beforeEach(() => {
  jest.clearAllMocks();
  useSnackbarStore.getState().dismiss();
});

async function renderSettings() {
  const services = createMockServices(user);
  services.userService.getUserProfile.mockResolvedValue(profile);
  await renderWithProviders(<SettingsScreen />, { services, user });
  await screen.findByLabelText('Always');
  return services;
}

describe('SettingsScreen', () => {
  it('turns on sharing while using the app after location access is granted', async () => {
    jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue(granted);
    const services = await renderSettings();

    await fireEvent.press(screen.getByLabelText('While using the app'));
    await waitFor(() =>
      expect(services.userService.setLocationSharing).toHaveBeenCalledWith('user-1', 'whileUsing'),
    );
  });

  it('falls back to "while using" when background access is denied', async () => {
    jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue(granted);
    jest.mocked(Location.requestBackgroundPermissionsAsync).mockResolvedValue(denied);
    const services = await renderSettings();

    await fireEvent.press(screen.getByLabelText('Always'));
    await waitFor(() =>
      expect(services.userService.setLocationSharing).toHaveBeenCalledWith('user-1', 'whileUsing'),
    );
    expect(useSnackbarStore.getState().message).toMatch(/only while using the app/);
  });

  it("doesn't save anything when location access is denied", async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue(denied);
    const services = await renderSettings();

    await fireEvent.press(screen.getByLabelText('While using the app'));
    await waitFor(() =>
      expect(alert).toHaveBeenCalledWith(
        'Location access needed',
        expect.any(String),
        expect.any(Array),
      ),
    );
    expect(services.userService.setLocationSharing).not.toHaveBeenCalled();
  });

  it('removes the shared location when turned off', async () => {
    const services = createMockServices(user);
    services.userService.getUserProfile.mockResolvedValue({
      ...profile,
      locationSharing: 'always',
    });
    await renderWithProviders(<SettingsScreen />, { services, user });

    await fireEvent.press(await screen.findByLabelText('Off'));
    await waitFor(() =>
      expect(services.locationService.stopSharing).toHaveBeenCalledWith('user-1'),
    );
    expect(services.userService.setLocationSharing).toHaveBeenCalledWith('user-1', 'off');
  });

  it('signs out only after confirming', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const services = await renderSettings();

    await fireEvent.press(screen.getByLabelText('Sign out'));
    expect(services.authService.signOut).not.toHaveBeenCalled();

    const buttons = alert.mock.calls[0]?.[2] ?? [];
    await act(async () => buttons.find((button) => button.text === 'Sign out')?.onPress?.());
    expect(services.authService.signOut).toHaveBeenCalled();
  });
});
