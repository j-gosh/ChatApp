import { getCountFromServer, getDoc, onSnapshot, setDoc } from '@react-native-firebase/firestore';
import { ZodError } from 'zod';

import { FirestoreUserService } from '@/services/user-service';

const mockGetDoc = jest.mocked(getDoc);
const mockSetDoc = jest.mocked(setDoc);
const mockOnSnapshot = jest.mocked(onSnapshot);

beforeEach(() => jest.clearAllMocks());

describe('FirestoreUserService.addUserToFriendsList', () => {
  it('keys the friend document by user id so re-adding is a no-op', async () => {
    await new FirestoreUserService().addUserToFriendsList('me', {
      id: 'grace',
      firstName: 'Grace',
    });

    expect(mockSetDoc).toHaveBeenCalledWith(
      { path: 'userFriendsList/me/friends/grace' },
      { id: 'grace', firstName: 'Grace', lastName: null, imageUrl: null },
    );
  });
});

describe('FirestoreUserService.subscribeFriends', () => {
  it('de-duplicates legacy auto-id friend documents by user id', () => {
    const observer = { next: jest.fn(), error: jest.fn() };
    mockOnSnapshot.mockImplementation(((_ref: unknown, onNext: (snapshot: unknown) => void) => {
      onNext({
        docs: [
          { id: 'auto-1', data: () => ({ id: 'grace', firstName: 'Grace' }) },
          { id: 'auto-2', data: () => ({ id: 'grace', firstName: 'Grace' }) },
          { id: 'alan', data: () => ({ firstName: 'Alan' }) },
        ],
      });
      return jest.fn();
    }) as unknown as typeof onSnapshot);

    new FirestoreUserService().subscribeFriends('me', observer);

    expect(observer.next).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'grace', firstName: 'Grace' }),
      expect.objectContaining({ id: 'alan', firstName: 'Alan' }),
    ]);
  });
});

describe('FirestoreUserService.getUserProfile', () => {
  it('returns null when the profile does not exist', async () => {
    mockGetDoc.mockResolvedValue({ data: () => undefined } as never);
    await expect(new FirestoreUserService().getUserProfile('me')).resolves.toBeNull();
  });

  it('rejects malformed profile documents', async () => {
    mockGetDoc.mockResolvedValue({ data: () => ({ userName: 1 }) } as never);
    await expect(new FirestoreUserService().getUserProfile('me')).rejects.toBeInstanceOf(ZodError);
  });
});

describe('FirestoreUserService following', () => {
  it('follows by writing a document keyed by the followed user', async () => {
    await new FirestoreUserService().follow('me', 'grace');
    expect(mockSetDoc).toHaveBeenCalledWith(
      { path: 'following/me/users/grace' },
      { createdAt: 'SERVER_TIMESTAMP' },
    );
  });

  it('counts followed users with an aggregate query', async () => {
    jest.mocked(getCountFromServer).mockResolvedValue({ data: () => ({ count: 3 }) } as never);
    await expect(new FirestoreUserService().countFollowing('me')).resolves.toBe(3);
  });
});
