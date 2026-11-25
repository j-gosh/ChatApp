import { MemorySchema, type Memory } from '@/models/memory';
import { mockData } from '@/mock-data';
import { parseDoc, toMillis } from '@/services/firestore-utils';
import type { MemoryService } from '@/services/memory-service';
import { docs, emit, newestFirst } from '@/services/mock/mock-utils';
import type { Observer, Unsubscribe } from '@/services/observer';

/** Read-only {@link MemoryService} backed by `src/mock-data`. Writes resolve without saving. */
export class MockMemoryService implements MemoryService {
  subscribeMemories(userId: string, observer: Observer<Memory[]>): Unsubscribe {
    return emit(observer, () =>
      docs(mockData.memories[userId])
        .sort(newestFirst('createdAt'))
        .flatMap(([id, data]) => {
          const fields = parseDoc(MemorySchema, `memories/${userId}/items/${id}`, data);
          return fields ? [{ ...fields, id, createdAt: toMillis(data.createdAt) }] : [];
        }),
    );
  }

  async saveMemory(): Promise<void> {}

  async deleteMemory(): Promise<void> {}
}
