import { onSnapshot, setDoc, updateDoc } from '@react-native-firebase/firestore';

import { FirebaseLocationService } from '@/services/location-service';

const mockUpdateDoc = jest.mocked(updateDoc);
const mockSetDoc = jest.mocked(setDoc);
const mockOnSnapshot = jest.mocked(onSnapshot);

const user = { uid: 'me', displayName: 'Ada', photoURL: null };
const coordinates = { latitude: 1, longitude: 2 };

beforeEach(() => jest.clearAllMocks());

describe('FirebaseLocationService.shareLocation', () => {
  it('updates the position without touching viewerIds', async () => {
    mockUpdateDoc.mockResolvedValue(undefined);
    await new FirebaseLocationService().shareLocation(user, coordinates);

    expect(mockUpdateDoc).toHaveBeenCalledWith(
      { path: 'locations/me' },
      expect.not.objectContaining({ viewerIds: expect.anything() }),
    );
    expect(mockSetDoc).not.toHaveBeenCalled();
  });

  it('creates the document, visible only to the owner, the first time', async () => {
    mockUpdateDoc.mockRejectedValue(
      Object.assign(new Error('missing'), { code: 'firestore/not-found' }),
    );
    await new FirebaseLocationService().shareLocation(user, coordinates);

    expect(mockSetDoc).toHaveBeenCalledWith(
      { path: 'locations/me' },
      expect.objectContaining({ latitude: 1, longitude: 2, displayName: 'Ada', viewerIds: ['me'] }),
    );
  });

  it('rethrows other failures', async () => {
    mockUpdateDoc.mockRejectedValue(
      Object.assign(new Error('denied'), { code: 'firestore/permission-denied' }),
    );
    await expect(new FirebaseLocationService().shareLocation(user, coordinates)).rejects.toThrow(
      'denied',
    );
    expect(mockSetDoc).not.toHaveBeenCalled();
  });
});

describe('FirebaseLocationService.subscribeFriendLocations', () => {
  it("skips the user's own location", () => {
    mockOnSnapshot.mockImplementation(((_query: unknown, onNext: (snapshot: unknown) => void) => {
      const location = (id: string) => ({
        id,
        ref: { path: `locations/${id}` },
        data: () => ({ latitude: 1, longitude: 2, displayName: id }),
      });
      onNext({ docs: [location('me'), location('grace')] });
      return jest.fn();
    }) as unknown as typeof onSnapshot);
    const observer = { next: jest.fn(), error: jest.fn() };

    new FirebaseLocationService().subscribeFriendLocations('me', observer);
    expect(observer.next).toHaveBeenCalledWith([expect.objectContaining({ id: 'grace' })]);
  });
});
