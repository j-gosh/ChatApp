import { act, fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { MessageThreadsList } from '@/features/chats/MessageThreadsList';
import type { Room } from '@/models/chat';
import type { Observer } from '@/services/observer';
import { useChatStore } from '@/stores/chat-store';
import { createMockServices, fakeUser } from '@test/mock-services';
import { renderWithProviders } from '@test/render';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

const user = fakeUser();
const rooms: Room[] = [
  { id: 'r1', type: 'direct', users: [], name: 'Grace Hopper' },
  { id: 'r2', type: 'direct', users: [], name: 'Alan Turing' },
];

async function renderList() {
  const services = createMockServices(user);
  let observer!: Observer<Room[]>;
  services.chatService.subscribeRooms.mockImplementation((next) => {
    observer = next;
    return jest.fn();
  });
  await renderWithProviders(<MessageThreadsList />, { services, user });
  return {
    emit: (value: Room[]) => act(() => observer.next(value)),
    fail: (error: Error) => act(() => observer.error(error)),
  };
}

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  useChatStore.setState({ selectedRoom: null });
});

describe('MessageThreadsList', () => {
  it('shows a loading indicator until rooms arrive', async () => {
    await renderList();
    expect(screen.getByRole('progressbar')).toBeOnTheScreen();
  });

  it('shows an empty state when there are no rooms', async () => {
    const { emit } = await renderList();
    await emit([]);
    expect(screen.getByText('You have no messages.')).toBeOnTheScreen();
  });

  it('shows one row per room with the room name', async () => {
    const { emit } = await renderList();
    await emit(rooms);
    expect(screen.getByText('Grace Hopper')).toBeOnTheScreen();
    expect(screen.getByText('Alan Turing')).toBeOnTheScreen();
  });

  it('shows an error when rooms fail to load', async () => {
    const { fail } = await renderList();
    await fail(new Error('permission-denied'));
    expect(screen.getByText("Couldn't load your conversations.")).toBeOnTheScreen();
  });

  it('opens the tapped room', async () => {
    const { emit } = await renderList();
    await emit(rooms);
    await fireEvent.press(screen.getByText('Alan Turing'));
    expect(useChatStore.getState().selectedRoom).toEqual(rooms[1]);
    expect(router.push).toHaveBeenCalledWith('/messages');
  });
});
