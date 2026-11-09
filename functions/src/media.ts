import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { onDocumentCreated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { deleteStorageFile } from './storage-files.js';

const SNAP_TTL_DAYS = 30;
const BATCH_LIMIT = 500;

/** Counts each snap toward the sender's and the recipient's Snap Totals. */
export const onSnapCreated = onDocumentCreated('snaps/{snapId}', async (event) => {
  if (!event.data) return;
  const db = getFirestore();
  const userIds = [event.data.get('senderId'), event.data.get('recipientId')].filter(
    (id): id is string => typeof id === 'string',
  );
  await Promise.all(
    userIds.map((uid) =>
      db
        .doc(`profileData/${uid}`)
        .update({ snapCount: FieldValue.increment(1) })
        .catch((error: unknown) => {
          // A missing profile is repaired by the app on next sign-in; don't create a partial one.
          logger.warn('Could not update snap count', { uid, error });
        }),
    ),
  );
});

/** Deletes a snap's photo once no recipient still has it. */
export const onSnapDeleted = onDocumentDeleted('snaps/{snapId}', async (event) => {
  if (!event.data) return;
  const batchId: unknown = event.data.get('batchId');
  if (typeof batchId !== 'string') {
    logger.warn('Snap has no batchId', { snapId: event.params.snapId });
    return;
  }
  const remaining = await getFirestore()
    .collection('snaps')
    .where('batchId', '==', batchId)
    .limit(1)
    .get();
  if (remaining.empty) {
    await deleteStorageFile(event.data.get('storagePath'));
  }
});

/** Deletes snaps nobody opened within {@link SNAP_TTL_DAYS} days. */
export const purgeExpiredSnaps = onSchedule('every 24 hours', async () => {
  const db = getFirestore();
  const cutoff = Timestamp.fromMillis(Date.now() - SNAP_TTL_DAYS * 24 * 60 * 60 * 1000);
  let deleted = 0;
  for (;;) {
    const expired = await db
      .collection('snaps')
      .where('createdAt', '<', cutoff)
      .limit(BATCH_LIMIT)
      .get();
    if (expired.empty) break;
    const batch = db.batch();
    expired.docs.forEach((snap) => batch.delete(snap.ref));
    await batch.commit();
    deleted += expired.size;
  }
  logger.info('Purged expired snaps', { deleted });
});

export const onStoryDeleted = onDocumentDeleted('stories/{storyId}', async (event) => {
  if (!event.data) return;
  await deleteStorageFile(event.data.get('storagePath'));
});

export const onMemoryDeleted = onDocumentDeleted('memories/{uid}/items/{memoryId}', async (event) => {
  if (!event.data) return;
  await deleteStorageFile(event.data.get('storagePath'));
});
