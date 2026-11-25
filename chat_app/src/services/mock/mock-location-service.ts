import { FriendLocationSchema, type MapFriend } from '@/models/map-friend';
import { mockData } from '@/mock-data';
import { parseDoc, toMillis } from '@/services/firestore-utils';
import type { LocationService } from '@/services/location-service';
import { arrayContains, docs, emit } from '@/services/mock/mock-utils';
import type { Observer, Unsubscribe } from '@/services/observer';

/** Read-only {@link LocationService} backed by `src/mock-data`. Writes resolve without saving. */
export class MockLocationService implements LocationService {
  subscribeFriendLocations(userId: string, observer: Observer<MapFriend[]>): Unsubscribe {
    return emit(observer, () =>
      docs(mockData.locations).flatMap(([id, data]) => {
        if (id === userId || !arrayContains(data, 'viewerIds', userId)) return [];
        const fields = parseDoc(FriendLocationSchema, `locations/${id}`, data);
        return fields ? [{ ...fields, id, updatedAt: toMillis(data.updatedAt) }] : [];
      }),
    );
  }

  async shareLocation(): Promise<void> {}

  async stopSharing(): Promise<void> {}
}
