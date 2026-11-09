import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from '@react-native-firebase/firestore';

import { FriendLocationSchema, type MapFriend } from '@/models/map-friend';
import { parseDoc, toMillis } from '@/services/firestore-utils';
import type { Observer, Unsubscribe } from '@/services/observer';

const LOCATIONS_COLLECTION = 'locations';

export interface SharingUser {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Contract for location sharing. The concrete implementation is
 * {@link FirebaseLocationService}. It has no React dependencies so the
 * background location task can use it too.
 *
 * `locations/{uid}` is readable by the owner's friends via `viewerIds`, which
 * Cloud Functions maintain.
 */
export interface LocationService {
  /** Live list of friends sharing their location with `userId`. */
  subscribeFriendLocations(userId: string, observer: Observer<MapFriend[]>): Unsubscribe;

  /** Publishes `user`'s current position to their friends. */
  shareLocation(user: SharingUser, coordinates: Coordinates): Promise<void>;

  /** Removes `userId`'s shared location so friends no longer see it. */
  stopSharing(userId: string): Promise<void>;
}

function hasCode(error: unknown, code: string): boolean {
  return error !== null && typeof error === 'object' && 'code' in error && error.code === code;
}

/** Firestore-backed implementation of {@link LocationService}. */
export class FirebaseLocationService implements LocationService {
  private readonly db = getFirestore();

  subscribeFriendLocations(userId: string, observer: Observer<MapFriend[]>): Unsubscribe {
    return onSnapshot(
      query(
        collection(this.db, LOCATIONS_COLLECTION),
        where('viewerIds', 'array-contains', userId),
      ),
      (snapshot) =>
        observer.next(
          snapshot.docs.flatMap((locationDoc) => {
            if (locationDoc.id === userId) return [];
            const data = locationDoc.data({ serverTimestamps: 'estimate' });
            const fields = parseDoc(FriendLocationSchema, locationDoc.ref.path, data);
            return fields
              ? [{ ...fields, id: locationDoc.id, updatedAt: toMillis(data.updatedAt) }]
              : [];
          }),
        ),
      observer.error,
    );
  }

  async shareLocation(user: SharingUser, { latitude, longitude }: Coordinates): Promise<void> {
    const locationRef = doc(this.db, LOCATIONS_COLLECTION, user.uid);
    const position = {
      latitude,
      longitude,
      displayName: user.displayName ?? '',
      imageUrl: user.photoURL,
      updatedAt: serverTimestamp(),
    };
    try {
      // `viewerIds` is owned by Cloud Functions after creation, so only update the position.
      await updateDoc(locationRef, position);
    } catch (error) {
      if (!hasCode(error, 'firestore/not-found')) throw error;
      await setDoc(locationRef, { ...position, viewerIds: [user.uid] });
    }
  }

  async stopSharing(userId: string): Promise<void> {
    await deleteDoc(doc(this.db, LOCATIONS_COLLECTION, userId));
  }
}
