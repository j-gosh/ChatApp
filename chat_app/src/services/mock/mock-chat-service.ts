import {
  getUserDisplayName,
  type ChatMessage,
  type ChatUser,
  type Room,
  type RoomType,
} from '@/models/chat';
import { mockData, type MockDoc } from '@/mock-data';
import type { AuthService } from '@/services/auth-service';
import { mapChatUser, type ChatService } from '@/services/chat-service';
import { optionalRecord, optionalString, toMillis } from '@/services/firestore-utils';
import { arrayContains, docs, emit, newestFirst } from '@/services/mock/mock-utils';
import type { Observer, Unsubscribe } from '@/services/observer';

const ROOM_TYPES: readonly RoomType[] = ['channel', 'direct', 'group'];

function getUser(id: string): ChatUser {
  const data = mockData.users[id];
  return data ? mapChatUser(id, data) : { id };
}

/** Mirrors `FirebaseChatService.processRoom`: direct rooms are named after the other user. */
function toRoom(id: string, data: MockDoc, currentUserId: string): Room {
  const userIds = Array.isArray(data.userIds)
    ? data.userIds.filter((userId: unknown): userId is string => typeof userId === 'string')
    : [];
  const users = userIds.map(getUser);
  const type = ROOM_TYPES.find((roomType) => roomType === data.type) ?? 'direct';

  let name = optionalString(data.name);
  let imageUrl = optionalString(data.imageUrl);
  if (type === 'direct') {
    const otherUser = users.find((user) => user.id !== currentUserId);
    if (otherUser) {
      name = getUserDisplayName(otherUser) || name;
      imageUrl = otherUser.imageUrl ?? imageUrl;
    }
  }

  return {
    id,
    type,
    users,
    name,
    imageUrl,
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
    metadata: optionalRecord(data.metadata),
  };
}

/** Read-only {@link ChatService} backed by `src/mock-data`. Writes resolve without saving. */
export class MockChatService implements ChatService {
  constructor(private readonly authService: AuthService) {}

  subscribeRooms(observer: Observer<Room[]>): Unsubscribe {
    const uid = this.authService.currentUser?.uid;
    if (!uid) {
      observer.error(new Error('User not authenticated'));
      return () => {};
    }
    return emit(observer, () =>
      docs(mockData.rooms)
        .filter(([, data]) => arrayContains(data, 'userIds', uid))
        .sort(newestFirst('updatedAt'))
        .map(([id, data]) => toRoom(id, data, uid)),
    );
  }

  subscribeMessages(room: Room, observer: Observer<ChatMessage[]>): Unsubscribe {
    return emit(observer, () =>
      docs(mockData.messages[room.id])
        .sort(newestFirst('createdAt'))
        .map(([id, data]): ChatMessage => {
          const authorId = String(data.authorId);
          const base = {
            id,
            author: room.users.find((user) => user.id === authorId) ?? { id: authorId },
            roomId: room.id,
            createdAt: toMillis(data.createdAt),
            updatedAt: toMillis(data.updatedAt),
          };
          return data.type === 'text' && typeof data.text === 'string'
            ? { ...base, type: 'text', text: data.text }
            : { ...base, type: 'unsupported' };
        }),
    );
  }

  subscribeUsers(observer: Observer<ChatUser[]>): Unsubscribe {
    const uid = this.authService.currentUser?.uid;
    return emit(observer, () =>
      docs(mockData.users)
        .filter(([id]) => id !== uid)
        .map(([id, data]) => mapChatUser(id, data)),
    );
  }

  async sendMessage(): Promise<void> {}

  async createRoom(otherUser: ChatUser): Promise<Room> {
    const uid = this.authService.currentUser?.uid;
    if (!uid) throw new Error('User not authenticated');

    const existingRoom = docs(mockData.rooms).find(
      ([, data]) =>
        data.type === 'direct' &&
        arrayContains(data, 'userIds', uid) &&
        arrayContains(data, 'userIds', otherUser.id),
    );
    if (existingRoom) return toRoom(existingRoom[0], existingRoom[1], uid);

    // Not saved, so it won't appear in the rooms list.
    return {
      id: `mock-direct-${uid}-${otherUser.id}`,
      type: 'direct',
      users: [getUser(uid), otherUser],
      name: getUserDisplayName(otherUser) || undefined,
      imageUrl: otherUser.imageUrl,
    };
  }

  async updateRoom(): Promise<void> {}

  async createUserInFirestore(): Promise<void> {}
}
