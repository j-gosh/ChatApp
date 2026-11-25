import { SnapSchema, type Snap } from '@/models/snap';
import { mockData, type MockDoc } from '@/mock-data';
import { parseDoc, toMillis } from '@/services/firestore-utils';
import type { MediaService } from '@/services/media-service';
import { docs, emit, newestFirst } from '@/services/mock/mock-utils';
import type { Observer, Unsubscribe } from '@/services/observer';
import type { SendSnapInput, SnapService } from '@/services/snap-service';

function toSnap(id: string, data: MockDoc): Snap | undefined {
  const fields = parseDoc(SnapSchema, `snaps/${id}`, data);
  return fields && { ...fields, id, createdAt: toMillis(data.createdAt) };
}

/**
 * Read-only {@link SnapService} backed by `src/mock-data`. Sending and opening
 * resolve without saving, so opened snaps stay in the list.
 */
export class MockSnapService implements SnapService {
  constructor(private readonly mediaService: MediaService) {}

  async sendSnap({ sender, recipientIds }: SendSnapInput): Promise<void> {
    if (!recipientIds.some((id) => id !== sender.id)) {
      throw new Error('Choose at least one friend.');
    }
  }

  subscribeReceivedSnaps(userId: string, observer: Observer<Snap[]>): Unsubscribe {
    return emit(observer, () =>
      docs(mockData.snaps)
        .filter(([, data]) => data.recipientId === userId)
        .sort(newestFirst('createdAt'))
        .flatMap(([id, data]) => toSnap(id, data) ?? []),
    );
  }

  async getSnap(snapId: string): Promise<{ snap: Snap; imageUrl: string } | null> {
    const data = mockData.snaps[snapId];
    const snap = data && toSnap(snapId, data);
    if (!snap) return null;
    return { snap, imageUrl: await this.mediaService.getDownloadUrl(snap.storagePath) };
  }

  async consumeSnap(): Promise<void> {}
}
