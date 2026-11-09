import type { Room } from '@/models/chat';
import { useChatStore } from '@/stores/chat-store';
import { showSnackbar, useSnackbarStore } from '@/stores/snackbar-store';
import { useUiStore } from '@/stores/ui-store';

const room: Room = { id: 'room-1', type: 'direct', users: [{ id: 'a' }, { id: 'b' }] };

beforeEach(() => {
  useUiStore.setState({ chatPage: 'threads', friendsPage: 'friends' });
  useChatStore.setState({ selectedRoom: null });
  useSnackbarStore.setState({ message: null });
});

describe('ui store', () => {
  it('starts on the threads page and the friends list', () => {
    expect(useUiStore.getState()).toMatchObject({ chatPage: 'threads', friendsPage: 'friends' });
  });

  it('switches the chat page', () => {
    useUiStore.getState().setChatPage('friends');
    expect(useUiStore.getState().chatPage).toBe('friends');
  });

  it('switches the friends page', () => {
    useUiStore.getState().setFriendsPage('activeUsers');
    expect(useUiStore.getState().friendsPage).toBe('activeUsers');
  });
});

describe('chat store', () => {
  it('starts with no selected room', () => {
    expect(useChatStore.getState().selectedRoom).toBeNull();
  });

  it('selects a room', () => {
    useChatStore.getState().selectRoom(room);
    expect(useChatStore.getState().selectedRoom).toBe(room);
  });

  it('clears the selected room', () => {
    useChatStore.getState().selectRoom(room);
    useChatStore.getState().clearSelectedRoom();
    expect(useChatStore.getState().selectedRoom).toBeNull();
  });
});

describe('snackbar store', () => {
  it('shows and dismisses a message', () => {
    showSnackbar('Saved');
    expect(useSnackbarStore.getState().message).toBe('Saved');
    useSnackbarStore.getState().dismiss();
    expect(useSnackbarStore.getState().message).toBeNull();
  });
});
