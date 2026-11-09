import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
  type QueryDocumentSnapshot,
} from '@react-native-firebase/firestore';

import { SnapSchema, type Snap } from '@/models/snap';
import { parseDoc, toMillis } from '@/services/firestore-utils';
import { discardUpload, type MediaService } from '@/services/media-service';
import type { Observer, Unsubscribe } from '@/services/observer';

const SNAPS_COLLECTION = 'snaps';

export interface SendSnapInput {
  sender: { id: string; name: string };
  recipientIds: string[];
  localUri: string;
}

/**
 * Contract for snaps: photos sent to friends that disappear once opened.
 * The concrete implementation is {@link FirebaseSnapService}.
 *
 * Each recipient gets their own `snaps/{batchId}_{recipientId}` document that
 * points at one shared photo. Cloud Functions delete the photo after the last
 * recipient opens it, and purge snaps left unopened for 30 days.
 */
export interface SnapService {
  sendSnap(input: SendSnapInput): Promise<void>;

  /** Live list of unopened snaps sent to `userId`, newest first. */
  subscribeReceivedSnaps(userId: string, observer: Observer<Snap[]>): Unsubscribe;

  /** Returns the snap with its photo URL, or null if it was already opened or expired. */
  getSnap(snapId: string): Promise<{ snap: Snap; imageUrl: string } | null>;

  /** Marks a snap as opened by deleting it. */
  consumeSnap(snapId: string): Promise<void>;
}

function toSnap(id: string, path: string, data: Record<string, unknown>): Snap | undefined {
  const fields = parseDoc(SnapSchema, path, data);
  return fields && { ...fields, id, createdAt: toMillis(data.createdAt) };
}

/** Firestore-backed implementation of {@link SnapService}. */
export class FirebaseSnapService implements SnapService {
  private readonly db = getFirestore();

  constructor(private readonly mediaService: MediaService) {}

  async sendSnap({ sender, recipientIds, localUri }: SendSnapInput): Promise<void> {
    const recipients = [...new Set(recipientIds)].filter((id) => id !== sender.id);
    if (recipients.length === 0) throw new Error('Choose at least one friend.');

    const batchId = doc(collection(this.db, SNAPS_COLLECTION)).id;
    const { storagePath } = await this.mediaService.uploadImage(
      localUri,
      `${SNAPS_COLLECTION}/${sender.id}/${batchId}/image.jpg`,
    );
    try {
      const batch = writeBatch(this.db);
      for (const recipientId of recipients) {
        batch.set(doc(this.db, SNAPS_COLLECTION, `${batchId}_${recipientId}`), {
          batchId,
          senderId: sender.id,
          senderName: sender.name,
          recipientId,
          storagePath,
          createdAt: serverTimestamp(),
        });
      }
      await batch.commit();
    } catch (error) {
      discardUpload(this.mediaService, storagePath);
      throw error;
    }
  }

  subscribeReceivedSnaps(userId: string, observer: Observer<Snap[]>): Unsubscribe {
    return onSnapshot(
      query(
        collection(this.db, SNAPS_COLLECTION),
        where('recipientId', '==', userId),
        orderBy('createdAt', 'desc'),
      ),
      (snapshot) =>
        observer.next(
          snapshot.docs.flatMap(
            (snapDoc: QueryDocumentSnapshot) =>
              toSnap(snapDoc.id, snapDoc.ref.path, snapDoc.data()) ?? [],
          ),
        ),
      observer.error,
    );
  }

  async getSnap(snapId: string): Promise<{ snap: Snap; imageUrl: string } | null> {
    const snapshot = await getDoc(doc(this.db, SNAPS_COLLECTION, snapId));
    const data = snapshot.data();
    const snap = data && toSnap(snapId, snapshot.ref.path, data);
    if (!snap) return null;
    return { snap, imageUrl: await this.mediaService.getDownloadUrl(snap.storagePath) };
  }

  async consumeSnap(snapId: string): Promise<void> {
    await deleteDoc(doc(this.db, SNAPS_COLLECTION, snapId));
  }
}
