import { doc, writeBatch } from '@react-native-firebase/firestore';

import type { MediaService } from '@/services/media-service';
import { FirebaseSnapService } from '@/services/snap-service';

const mockWriteBatch = jest.mocked(writeBatch);
const mockDoc = jest.mocked(doc);

function mediaService(): jest.Mocked<MediaService> {
  return {
    uploadImage: jest.fn().mockImplementation(async (_uri: string, storagePath: string) => ({
      storagePath,
      url: 'https://img',
    })),
    getDownloadUrl: jest.fn(),
    deleteFile: jest.fn().mockResolvedValue(undefined),
  };
}

function mockBatch(commit: () => Promise<void> = async () => {}) {
  const batch = { set: jest.fn(), commit: jest.fn(commit) };
  mockWriteBatch.mockReturnValue(batch as never);
  return batch;
}

beforeEach(() => jest.clearAllMocks());

describe('FirebaseSnapService.sendSnap', () => {
  it('uploads once and writes one snap per distinct recipient, excluding the sender', async () => {
    const media = mediaService();
    const batch = mockBatch();
    // The first `doc()` call generates the batch id.
    mockDoc.mockReturnValueOnce({ id: 'batch-1', path: 'snaps/batch-1' } as never);

    await new FirebaseSnapService(media).sendSnap({
      sender: { id: 'me', name: 'Ada' },
      recipientIds: ['grace', 'alan', 'grace', 'me'],
      localUri: 'file:///photo.jpg',
    });

    expect(media.uploadImage).toHaveBeenCalledTimes(1);
    const storagePath = 'snaps/me/batch-1/image.jpg';
    const batchId = 'batch-1';
    expect(media.uploadImage).toHaveBeenCalledWith('file:///photo.jpg', storagePath);

    expect(batch.set.mock.calls.map(([ref]) => (ref as { path: string }).path)).toEqual([
      `snaps/${batchId}_grace`,
      `snaps/${batchId}_alan`,
    ]);
    expect(batch.set).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ batchId, senderId: 'me', recipientId: 'grace', storagePath }),
    );
  });

  it('rejects without uploading when there are no recipients', async () => {
    const media = mediaService();
    await expect(
      new FirebaseSnapService(media).sendSnap({
        sender: { id: 'me', name: 'Ada' },
        recipientIds: ['me'],
        localUri: 'file:///photo.jpg',
      }),
    ).rejects.toThrow('Choose at least one friend.');
    expect(media.uploadImage).not.toHaveBeenCalled();
  });

  it('deletes the uploaded photo if the snaps could not be saved', async () => {
    const media = mediaService();
    mockBatch(async () => {
      throw new Error('offline');
    });

    await expect(
      new FirebaseSnapService(media).sendSnap({
        sender: { id: 'me', name: 'Ada' },
        recipientIds: ['grace'],
        localUri: 'file:///photo.jpg',
      }),
    ).rejects.toThrow('offline');
    expect(media.deleteFile).toHaveBeenCalledWith(media.uploadImage.mock.calls[0]?.[1]);
  });
});
