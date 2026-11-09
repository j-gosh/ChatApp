import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from '@react-native-firebase/firestore';

import { MemorySchema, type Memory } from '@/models/memory';
import { parseDoc, toMillis } from '@/services/firestore-utils';
import { discardUpload, type MediaService } from '@/services/media-service';
import type { Observer, Unsubscribe } from '@/services/observer';

const MEMORIES_COLLECTION = 'memories';
const ITEMS_SUBCOLLECTION = 'items';

/**
 * Contract for memories: photos the user saves privately to their profile.
 * The concrete implementation is {@link FirebaseMemoryService}.
 */
export interface MemoryService {
  /** Live list of `userId`'s memories, newest first. */
  subscribeMemories(userId: string, observer: Observer<Memory[]>): Unsubscribe;

  saveMemory(userId: string, localUri: string): Promise<void>;

  /** Deletes the memory. Cloud Functions remove its photo. */
  deleteMemory(userId: string, memoryId: string): Promise<void>;
}

/** Firestore-backed implementation of {@link MemoryService}. */
export class FirebaseMemoryService implements MemoryService {
  private readonly db = getFirestore();

  constructor(private readonly mediaService: MediaService) {}

  subscribeMemories(userId: string, observer: Observer<Memory[]>): Unsubscribe {
    return onSnapshot(
      query(
        collection(this.db, MEMORIES_COLLECTION, userId, ITEMS_SUBCOLLECTION),
        orderBy('createdAt', 'desc'),
      ),
      (snapshot) =>
        observer.next(
          snapshot.docs.flatMap((memoryDoc) => {
            const data = memoryDoc.data({ serverTimestamps: 'estimate' });
            const fields = parseDoc(MemorySchema, memoryDoc.ref.path, data);
            return fields
              ? [{ ...fields, id: memoryDoc.id, createdAt: toMillis(data.createdAt) }]
              : [];
          }),
        ),
      observer.error,
    );
  }

  async saveMemory(userId: string, localUri: string): Promise<void> {
    const memoryRef = doc(collection(this.db, MEMORIES_COLLECTION, userId, ITEMS_SUBCOLLECTION));
    const { storagePath, url } = await this.mediaService.uploadImage(
      localUri,
      `${MEMORIES_COLLECTION}/${userId}/${memoryRef.id}/image.jpg`,
    );
    try {
      await setDoc(memoryRef, { imageUrl: url, storagePath, createdAt: serverTimestamp() });
    } catch (error) {
      discardUpload(this.mediaService, storagePath);
      throw error;
    }
  }

  async deleteMemory(userId: string, memoryId: string): Promise<void> {
    await deleteDoc(doc(this.db, MEMORIES_COLLECTION, userId, ITEMS_SUBCOLLECTION, memoryId));
  }
}
