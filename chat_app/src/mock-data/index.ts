import { z } from 'zod';

import authAccountsJson from './auth-accounts.json';
import followingJson from './following.json';
import locationsJson from './locations.json';
import memoriesJson from './memories.json';
import messagesJson from './messages.json';
import newsJson from './news.json';
import profileDataJson from './profile-data.json';
import roomsJson from './rooms.json';
import snapsJson from './snaps.json';
import storageJson from './storage.json';
import storiesJson from './stories.json';
import subscriptionsJson from './subscriptions.json';
import userFriendsListJson from './user-friends-list.json';
import usersJson from './users.json';

/** A Firestore document's fields, keyed like the real document. */
export type MockDoc = Record<string, unknown>;

/** A Firestore collection: document id -> fields. */
export type MockCollection = Record<string, MockDoc>;

/** A subcollection per parent document, e.g. `rooms/{roomId}/messages`. */
export type MockSubcollections = Record<string, MockCollection>;

const MockAccountSchema = z.object({
  uid: z.string(),
  email: z.string(),
  password: z.string(),
  displayName: z.string().nullable(),
  photoURL: z.string().nullable(),
  disabled: z.boolean().optional(),
});

/** A Firebase Auth account that can sign in with mock data. */
export type MockAccount = z.infer<typeof MockAccountSchema>;

// Firestore returns these as Timestamps; the JSON stores ISO strings for readability.
const TIMESTAMP_FIELDS = new Set(['createdAt', 'updatedAt', 'lastSeen', 'publishedAt']);

function toDoc(fields: object): MockDoc {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      TIMESTAMP_FIELDS.has(key) && typeof value === 'string' ? Date.parse(value) : value,
    ]),
  );
}

function toCollection(json: Record<string, object>): MockCollection {
  return Object.fromEntries(Object.entries(json).map(([id, fields]) => [id, toDoc(fields)]));
}

function toSubcollections(json: Record<string, Record<string, object>>): MockSubcollections {
  return Object.fromEntries(
    Object.entries(json).map(([parentId, docs]) => [parentId, toCollection(docs)]),
  );
}

/**
 * Debug-build fixtures shaped like the Firestore / Storage / Auth data the app
 * reads. Timestamps are converted to epoch millis, which `toMillis` accepts.
 */
export const mockData = {
  accounts: z.array(MockAccountSchema).parse(authAccountsJson),
  users: toCollection(usersJson),
  profileData: toCollection(profileDataJson),
  userFriendsList: toSubcollections(userFriendsListJson),
  following: toSubcollections(followingJson),
  rooms: toCollection(roomsJson),
  messages: toSubcollections(messagesJson),
  stories: toCollection(storiesJson),
  locations: toCollection(locationsJson),
  snaps: toCollection(snapsJson),
  memories: toSubcollections(memoriesJson),
  news: toCollection(newsJson),
  subscriptions: toCollection(subscriptionsJson),
  /** Storage path -> download URL. */
  storage: z.record(z.string(), z.string()).parse(storageJson),
};
