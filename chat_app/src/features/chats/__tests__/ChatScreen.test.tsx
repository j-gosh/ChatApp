import { fireEvent, screen } from '@testing-library/react-native';

import { ChatScreen } from '@/features/chats/ChatScreen';
import { useUiStore } from '@/stores/ui-store';
import { fakeUser } from '@test/mock-services';
import { renderWithProviders } from '@test/render';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

const renderChat = () => renderWithProviders(<ChatScreen />, { user: fakeUser() });

beforeEach(() => useUiStore.setState({ chatPage: 'threads', friendsPage: 'friends' }));

describe('ChatScreen', () => {
  it('starts with the Chats and New buttons', async () => {
    await renderChat();
    expect(screen.getByText('Chats')).toBeOnTheScreen();
    expect(screen.getByText('New')).toBeOnTheScreen();
    expect(screen.queryByText('Friends')).toBeNull();
    expect(screen.queryByText('Active Users')).toBeNull();
  });

  it('shows the conversations list first', async () => {
    const { services } = await renderChat();
    expect(services.chatService.subscribeRooms).toHaveBeenCalled();
  });

  it('shows Friends and Active Users after tapping New', async () => {
    const { services } = await renderChat();
    await fireEvent.press(screen.getByText('New'));
    expect(screen.getByText('Friends')).toBeOnTheScreen();
    expect(screen.getByText('Active Users')).toBeOnTheScreen();
    expect(services.userService.subscribeFriends).toHaveBeenCalledWith('user-1', expect.anything());
  });

  it('switches to all users with Active Users', async () => {
    const { services } = await renderChat();
    await fireEvent.press(screen.getByText('New'));
    await fireEvent.press(screen.getByText('Active Users'));
    expect(services.chatService.subscribeUsers).toHaveBeenCalled();
  });

  it('returns to conversations with Chats', async () => {
    await renderChat();
    await fireEvent.press(screen.getByText('New'));
    await fireEvent.press(screen.getByText('Chats'));
    expect(screen.getByText('New')).toBeOnTheScreen();
    expect(useUiStore.getState().chatPage).toBe('threads');
  });
});
