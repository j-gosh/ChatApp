import { getAuth } from '@react-native-firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from '@react-native-firebase/firestore';

import {
  getUserDisplayName,
  type ChatMessage,
  type ChatUser,
  type ChatUserRole,
  type PartialText,
  type Room,
  type RoomType,
} from '@/models/chat';
import { optionalRecord, optionalString, toMillis } from '@/services/firestore-utils';
import { toError, type Observer, type Unsubscribe } from '@/services/observer';

const USERS_COLLECTION = 'users';
const ROOMS_COLLECTION = 'rooms';
const MESSAGES_COLLECTION = 'messages';

const ROLES: readonly ChatUserRole[] = ['admin', 'agent', 'moderator', 'user'];
const ROOM_TYPES: readonly RoomType[] = ['channel', 'direct', 'group'];

/** Builds a {@link ChatUser} from a `users/{id}` (or friends-list) document. */
export function mapChatUser(id: string, data: DocumentData): ChatUser {
  return {
    id,
    firstName: optionalString(data.firstName),
    lastName: optionalString(data.lastName),
    imageUrl: optionalString(data.imageUrl),
    role: ROLES.find((role) => role === data.role),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
    lastSeen: toMillis(data.lastSeen),
    metadata: optionalRecord(data.metadata),
  };
}

/**
 * Contract for real-time chat operations.
 *
 * Subscriptions stay live via Firestore listeners. The concrete implementation is
 * {@link FirebaseChatService}.
 */
export interface ChatService {
  /** Live list of rooms the current user belongs to, most recently updated first. */
  subscribeRooms(observer: Observer<Room[]>): Unsubscribe;

  /** Live list of messages in `room`, newest first. */
  subscribeMessages(room: Room, observer: Observer<ChatMessage[]>): Unsubscribe;

  /** Live list of all registered chat users except the current user. */
  subscribeUsers(observer: Observer<ChatUser[]>): Unsubscribe;

  /** Sends a text message to the room identified by `roomId`. */
  sendMessage(message: PartialText, roomId: string): Promise<void>;

  /** Returns the existing direct room with `otherUser`, or creates one. */
  createRoom(otherUser: ChatUser): Promise<Room>;

  /** Updates metadata on `room`. */
  updateRoom(room: Room): Promise<void>;

  /** Creates (or overwrites) the public `users/{id}` document for `user`. */
  createUserInFirestore(user: ChatUser): Promise<void>;
}

/** Firestore-backed implementation of {@link ChatService} (a port of FirebaseChatCore). */
export class FirebaseChatService implements ChatService {
  private readonly db = getFirestore();
  private readonly auth = getAuth();

  subscribeRooms(observer: Observer<Room[]>): Unsubscribe {
    const uid = this.auth.currentUser?.uid;
    if (!uid) {
      observer.error(new Error('User not authenticated'));
      return () => {};
    }

    const roomsQuery = query(
      collection(this.db, ROOMS_COLLECTION),
      where('userIds', 'array-contains', uid),
      orderBy('updatedAt', 'desc'),
    );

    // Resolving room members is async, so a newer snapshot can finish before an
    // older one. Only deliver the result of the latest snapshot.
    let latestSnapshot = 0;
    return onSnapshot(
      roomsQuery,
      (snapshot) => {
        const snapshotId = ++latestSnapshot;
        const userCache = new Map<string, Promise<ChatUser>>();
        Promise.all(snapshot.docs.map((roomDoc) => this.processRoom(roomDoc, uid, userCache)))
          .then((rooms) => {
            if (snapshotId === latestSnapshot) observer.next(rooms);
          })
          .catch((error: unknown) => {
            if (snapshotId === latestSnapshot) observer.error(toError(error));
          });
      },
      observer.error,
    );
  }

  subscribeMessages(room: Room, observer: Observer<ChatMessage[]>): Unsubscribe {
    const messagesQuery = query(
      collection(this.db, ROOMS_COLLECTION, room.id, MESSAGES_COLLECTION),
      orderBy('createdAt', 'desc'),
    );

    return onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messages = snapshot.docs.map((messageDoc): ChatMessage => {
          // Pending writes have no server timestamp yet; estimate it so new
          // messages appear in order immediately.
          const data = messageDoc.data({ serverTimestamps: 'estimate' });
          const authorId = String(data.authorId);
          const base = {
            id: messageDoc.id,
            author: room.users.find((user) => user.id === authorId) ?? { id: authorId },
            roomId: room.id,
            createdAt: toMillis(data.createdAt),
            updatedAt: toMillis(data.updatedAt),
          };
          return data.type === 'text' && typeof data.text === 'string'
            ? { ...base, type: 'text', text: data.text }
            : { ...base, type: 'unsupported' };
        });
        observer.next(messages);
      },
      observer.error,
    );
  }

  subscribeUsers(observer: Observer<ChatUser[]>): Unsubscribe {
    const uid = this.auth.currentUser?.uid;
    return onSnapshot(
      collection(this.db, USERS_COLLECTION),
      (snapshot) => {
        observer.next(
          snapshot.docs
            .filter((userDoc) => userDoc.id !== uid)
            .map((userDoc) => mapChatUser(userDoc.id, userDoc.data())),
        );
      },
      observer.error,
    );
  }

  async sendMessage(message: PartialText, roomId: string): Promise<void> {
    const uid = this.requireUid();
    await addDoc(collection(this.db, ROOMS_COLLECTION, roomId, MESSAGES_COLLECTION), {
      authorId: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      type: 'text',
      text: message.text,
    });
    await updateDoc(doc(this.db, ROOMS_COLLECTION, roomId), { updatedAt: serverTimestamp() });
  }

  async createRoom(otherUser: ChatUser): Promise<Room> {
    const uid = this.requireUid();
    const userCache = new Map<string, Promise<ChatUser>>();

    const roomsSnapshot = await getDocs(
      query(collection(this.db, ROOMS_COLLECTION), where('userIds', 'array-contains', uid)),
    );
    const existingRoom = roomsSnapshot.docs.find((roomDoc) => {
      const data = roomDoc.data();
      return (
        data.type === 'direct' && Array.isArray(data.userIds) && data.userIds.includes(otherUser.id)
      );
    });
    if (existingRoom) return this.processRoom(existingRoom, uid, userCache);

    const currentUser = await this.fetchUser(uid, userCache);
    const roomRef = await addDoc(collection(this.db, ROOMS_COLLECTION), {
      createdAt: serverTimestamp(),
      imageUrl: null,
      metadata: null,
      name: null,
      type: 'direct',
      updatedAt: serverTimestamp(),
      userIds: [uid, otherUser.id],
      userRoles: null,
    });

    return {
      id: roomRef.id,
      type: 'direct',
      users: [currentUser, otherUser],
      name: getUserDisplayName(otherUser) || undefined,
      imageUrl: otherUser.imageUrl,
    };
  }

  async updateRoom(room: Room): Promise<void> {
    await updateDoc(doc(this.db, ROOMS_COLLECTION, room.id), {
      imageUrl: room.imageUrl ?? null,
      metadata: room.metadata ?? null,
      name: room.name ?? null,
      type: room.type,
      updatedAt: serverTimestamp(),
      userIds: room.users.map((user) => user.id),
    });
  }

  async createUserInFirestore(user: ChatUser): Promise<void> {
    await setDoc(doc(this.db, USERS_COLLECTION, user.id), {
      createdAt: serverTimestamp(),
      firstName: user.firstName ?? null,
      imageUrl: user.imageUrl ?? null,
      lastName: user.lastName ?? null,
      lastSeen: serverTimestamp(),
      metadata: user.metadata ?? null,
      role: user.role ?? null,
      updatedAt: serverTimestamp(),
    });
  }

  private requireUid(): string {
    const uid = this.auth.currentUser?.uid;
    if (!uid) throw new Error('User not authenticated');
    return uid;
  }

  private fetchUser(id: string, cache: Map<string, Promise<ChatUser>>): Promise<ChatUser> {
    let user = cache.get(id);
    if (!user) {
      user = getDoc(doc(this.db, USERS_COLLECTION, id)).then((snapshot) => {
        const data = snapshot.data();
        return data ? mapChatUser(id, data) : { id };
      });
      cache.set(id, user);
    }
    return user;
  }

  private async processRoom(
    roomDoc: QueryDocumentSnapshot,
    currentUserId: string,
    userCache: Map<string, Promise<ChatUser>>,
  ): Promise<Room> {
    const data = roomDoc.data({ serverTimestamps: 'estimate' });
    const userIds: string[] = Array.isArray(data.userIds)
      ? data.userIds.filter((id: unknown): id is string => typeof id === 'string')
      : [];
    const users = await Promise.all(userIds.map((id) => this.fetchUser(id, userCache)));
    const type = ROOM_TYPES.find((roomType) => roomType === data.type) ?? 'direct';

    let name = optionalString(data.name);
    let imageUrl = optionalString(data.imageUrl);
    if (type === 'direct') {
      // Direct rooms are named after the other participant.
      const otherUser = users.find((user) => user.id !== currentUserId);
      if (otherUser) {
        name = getUserDisplayName(otherUser) || name;
        imageUrl = otherUser.imageUrl ?? imageUrl;
      }
    }

    return {
      id: roomDoc.id,
      type,
      users,
      name,
      imageUrl,
      createdAt: toMillis(data.createdAt),
      updatedAt: toMillis(data.updatedAt),
      metadata: optionalRecord(data.metadata),
    };
  }
}
