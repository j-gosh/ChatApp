import { getStorage } from 'firebase-admin/storage';
import { logger } from 'firebase-functions';

/** Deletes a Storage object. A missing file is not an error. */
export async function deleteStorageFile(storagePath: unknown): Promise<void> {
  if (typeof storagePath !== 'string' || storagePath.length === 0) {
    logger.warn('Skipping Storage cleanup: document has no storagePath');
    return;
  }
  await getStorage().bucket().file(storagePath).delete({ ignoreNotFound: true });
}
