import { getAuth } from '@react-native-firebase/auth';
import { addDoc, getDoc, getDocs, onSnapshot, setDoc } from '@react-native-firebase/firestore';

import { FirebaseChatService } from '@/services/chat-service';

const mockGetAuth = jest.mocked(getAuth);
const mockGetDocs = jest.mocked(getDocs);
const mockGetDoc = jest.mocked(getDoc);
const mockAddDoc = jest.mocked(addDoc);
const mockSetDoc = jest.mocked(setDoc);
const mockOnSnapshot = jest.mocked(onSnapshot);

function docSnapshot(id: string, data: Record<string, unknown>) {
  return { id, data: () => data };
}

const users: Record<string, Record<string, unknown>> = {
  me: { firstName: 'Ada', lastName: 'Lovelace' },
  grace: { firstName: 'Grace', lastName: 'Hopper', imageUrl: 'https://img/grace.png' },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetAuth.mockReturnValue({ currentUser: { uid: 'me' } } as ReturnType<typeof getAuth>);
  mockGetDoc.mockImplementation((async (ref: { path: string }) => {
    const id = ref.path.split('/').pop()!;
    return { data: () => users[id] };
  }) as unknown as typeof getDoc);
});

describe('FirebaseChatService.createRoom', () => {
  it('returns the existing direct room instead of creating a duplicate', async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        docSnapshot('group-room', { type: 'group', userIds: ['me', 'grace'] }),
        docSnapshot('direct-room', { type: 'direct', userIds: ['me', 'grace'] }),
      ],
    } as never);

    const room = await new FirebaseChatService().createRoom({ id: 'grace' });

    expect(mockAddDoc).not.toHaveBeenCalled();
    expect(room).toMatchObject({
      id: 'direct-room',
      type: 'direct',
      name: 'Grace Hopper',
      imageUrl: 'https://img/grace.png',
    });
    expect(room.users.map((user) => user.id)).toEqual(['me', 'grace']);
  });

  it('creates a direct room with the chat-core document shape', async () => {
    mockGetDocs.mockResolvedValue({ docs: [] } as never);
    mockAddDoc.mockResolvedValue({ id: 'new-room' } as never);

    const room = await new FirebaseChatService().createRoom({ id: 'grace', firstName: 'Grace' });

    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ type: 'direct', userIds: ['me', 'grace'], name: null }),
    );
    expect(room).toMatchObject({ id: 'new-room', name: 'Grace' });
  });

  it('requires a signed-in user', async () => {
    mockGetAuth.mockReturnValue({ currentUser: null } as ReturnType<typeof getAuth>);
    await expect(new FirebaseChatService().createRoom({ id: 'grace' })).rejects.toThrow(
      'User not authenticated',
    );
  });
});

describe('FirebaseChatService.subscribeMessages', () => {
  it('maps text messages and resolves authors from the room', () => {
    const observer = { next: jest.fn(), error: jest.fn() };
    mockOnSnapshot.mockImplementation(((_query: unknown, onNext: (snapshot: unknown) => void) => {
      onNext({
        docs: [
          { id: 'm1', data: () => ({ authorId: 'grace', type: 'text', text: 'Hi' }) },
          { id: 'm2', data: () => ({ authorId: 'me', type: 'image', uri: 'x' }) },
        ],
      });
      return jest.fn();
    }) as unknown as typeof onSnapshot);

    const grace = { id: 'grace', firstName: 'Grace' };
    new FirebaseChatService().subscribeMessages(
      { id: 'room', type: 'direct', users: [{ id: 'me' }, grace] },
      observer,
    );

    expect(observer.next).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'm1', type: 'text', text: 'Hi', author: grace }),
      expect.objectContaining({ id: 'm2', type: 'unsupported', author: { id: 'me' } }),
    ]);
  });
});

describe('FirebaseChatService.subscribeRooms', () => {
  it('reports an error instead of subscribing when signed out', () => {
    mockGetAuth.mockReturnValue({ currentUser: null } as ReturnType<typeof getAuth>);
    const observer = { next: jest.fn(), error: jest.fn() };

    new FirebaseChatService().subscribeRooms(observer);

    expect(observer.error).toHaveBeenCalledWith(new Error('User not authenticated'));
    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });
});

describe('FirebaseChatService.createUserInFirestore', () => {
  it('writes the chat-core user document', async () => {
    await new FirebaseChatService().createUserInFirestore({
      id: 'me',
      firstName: 'Ada',
      lastName: 'Lovelace',
    });
    expect(mockSetDoc).toHaveBeenCalledWith(
      { path: 'users/me' },
      expect.objectContaining({ firstName: 'Ada', lastName: 'Lovelace', imageUrl: null }),
    );
  });
});
