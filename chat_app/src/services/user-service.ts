import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from '@react-native-firebase/firestore';

import type { ChatUser } from '@/models/chat';
import {
  UserProfileSchema,
  type LocationSharingMode,
  type UserProfile,
} from '@/models/user-profile';
import { mapChatUser } from '@/services/chat-service';
import type { Observer, Unsubscribe } from '@/services/observer';

const PROFILES_COLLECTION = 'profileData';
const FRIENDS_LISTS_COLLECTION = 'userFriendsList';
const FRIENDS_SUBCOLLECTION = 'friends';
const FOLLOWING_COLLECTION = 'following';
const FOLLOWING_SUBCOLLECTION = 'users';
// The public chat users written by the chat service.
const USERS_COLLECTION = 'users';

/**
 * Contract for user-profile and friends-list operations.
 *
 * Data lives in these Firestore collections:
 * - `profileData/{uid}` — profile documents
 * - `userFriendsList/{uid}/friends/{friendUid}` — friends subcollection
 * - `following/{uid}/users/{targetUid}` — people `uid` follows
 * - `users/{uid}` — public chat user (name and avatar)
 *
 * The concrete implementation is {@link FirestoreUserService}.
 */
export interface UserService {
  /** Returns the profile for `userId`, or null if it has not been created. */
  getUserProfile(userId: string): Promise<UserProfile | null>;

  saveUserProfile(
    userId: string,
    userName: string,
    firstName: string,
    lastName: string,
  ): Promise<void>;

  updateUserProfile(
    userId: string,
    userName: string,
    firstName: string,
    lastName: string,
  ): Promise<void>;

  /** Live list of `userId`'s friends. */
  subscribeFriends(userId: string, observer: Observer<ChatUser[]>): Unsubscribe;

  /** Adds `user` to `userId`'s friends. Adding the same friend twice is a no-op. */
  addUserToFriendsList(userId: string, user: ChatUser): Promise<void>;

  /** Returns the public chat user `userId`, or null if they don't exist. */
  getChatUser(userId: string): Promise<ChatUser | null>;

  /** Live public chat user `userId` (null if they don't exist). */
  subscribeChatUser(userId: string, observer: Observer<ChatUser | null>): Unsubscribe;

  /** Stores the download URL of `userId`'s profile photo. */
  setAvatarUrl(userId: string, imageUrl: string): Promise<void>;

  setLocationSharing(userId: string, mode: LocationSharingMode): Promise<void>;

  /** Live ids of the people `userId` follows. */
  subscribeFollowing(userId: string, observer: Observer<string[]>): Unsubscribe;

  /** How many people `userId` follows. */
  countFollowing(userId: string): Promise<number>;

  follow(userId: string, targetId: string): Promise<void>;

  unfollow(userId: string, targetId: string): Promise<void>;
}

/** Firestore-backed implementation of {@link UserService}. */
export class FirestoreUserService implements UserService {
  private readonly db = getFirestore();

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const snapshot = await getDoc(doc(this.db, PROFILES_COLLECTION, userId));
    const data = snapshot.data();
    return data ? UserProfileSchema.parse(data) : null;
  }

  saveUserProfile(
    userId: string,
    userName: string,
    firstName: string,
    lastName: string,
  ): Promise<void> {
    return setDoc(doc(this.db, PROFILES_COLLECTION, userId), {
      userName,
      first: firstName,
      last: lastName,
      groups: [],
    });
  }

  updateUserProfile(
    userId: string,
    userName: string,
    firstName: string,
    lastName: string,
  ): Promise<void> {
    return updateDoc(doc(this.db, PROFILES_COLLECTION, userId), {
      userName,
      first: firstName,
      last: lastName,
    });
  }

  subscribeFriends(userId: string, observer: Observer<ChatUser[]>): Unsubscribe {
    const friendsRef = collection(this.db, FRIENDS_LISTS_COLLECTION, userId, FRIENDS_SUBCOLLECTION);
    return onSnapshot(
      friendsRef,
      (snapshot) => {
        const friends = new Map<string, ChatUser>();
        for (const friendDoc of snapshot.docs) {
          const data = friendDoc.data();
          const id = typeof data.id === 'string' ? data.id : friendDoc.id;
          friends.set(id, mapChatUser(id, data));
        }
        observer.next([...friends.values()]);
      },
      observer.error,
    );
  }

  addUserToFriendsList(userId: string, user: ChatUser): Promise<void> {
    return setDoc(doc(this.db, FRIENDS_LISTS_COLLECTION, userId, FRIENDS_SUBCOLLECTION, user.id), {
      id: user.id,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      imageUrl: user.imageUrl ?? null,
    });
  }

  async getChatUser(userId: string): Promise<ChatUser | null> {
    const snapshot = await getDoc(doc(this.db, USERS_COLLECTION, userId));
    const data = snapshot.data();
    return data ? mapChatUser(userId, data) : null;
  }

  subscribeChatUser(userId: string, observer: Observer<ChatUser | null>): Unsubscribe {
    return onSnapshot(
      doc(this.db, USERS_COLLECTION, userId),
      (snapshot) => {
        const data = snapshot.data();
        observer.next(data ? mapChatUser(userId, data) : null);
      },
      observer.error,
    );
  }

  setAvatarUrl(userId: string, imageUrl: string): Promise<void> {
    return updateDoc(doc(this.db, USERS_COLLECTION, userId), {
      imageUrl,
      updatedAt: serverTimestamp(),
    });
  }

  setLocationSharing(userId: string, mode: LocationSharingMode): Promise<void> {
    return updateDoc(doc(this.db, PROFILES_COLLECTION, userId), { locationSharing: mode });
  }

  subscribeFollowing(userId: string, observer: Observer<string[]>): Unsubscribe {
    return onSnapshot(
      collection(this.db, FOLLOWING_COLLECTION, userId, FOLLOWING_SUBCOLLECTION),
      (snapshot) => observer.next(snapshot.docs.map((followDoc) => followDoc.id)),
      observer.error,
    );
  }

  async countFollowing(userId: string): Promise<number> {
    const snapshot = await getCountFromServer(
      collection(this.db, FOLLOWING_COLLECTION, userId, FOLLOWING_SUBCOLLECTION),
    );
    return snapshot.data().count;
  }

  follow(userId: string, targetId: string): Promise<void> {
    return setDoc(doc(this.db, FOLLOWING_COLLECTION, userId, FOLLOWING_SUBCOLLECTION, targetId), {
      createdAt: serverTimestamp(),
    });
  }

  unfollow(userId: string, targetId: string): Promise<void> {
    return deleteDoc(doc(this.db, FOLLOWING_COLLECTION, userId, FOLLOWING_SUBCOLLECTION, targetId));
  }
}
