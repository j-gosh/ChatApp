import { mockData } from '@/mock-data';
import type { MediaService, UploadedFile } from '@/services/media-service';
import { firebaseError } from '@/services/mock/mock-utils';

/**
 * {@link MediaService} backed by `src/mock-data/storage.json`. Uploads aren't
 * stored; they resolve with the local file as the download URL.
 */
export class MockMediaService implements MediaService {
  async uploadImage(localUri: string, storagePath: string): Promise<UploadedFile> {
    return { storagePath, url: localUri };
  }

  async getDownloadUrl(storagePath: string): Promise<string> {
    const url = mockData.storage[storagePath];
    if (!url) throw firebaseError('storage/object-not-found', `No mock file at ${storagePath}.`);
    return url;
  }

  async deleteFile(): Promise<void> {}
}
