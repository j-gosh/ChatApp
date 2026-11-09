// Security rules tests. Run against the emulators from the repo root:
//   firebase emulators:exec --only firestore,storage "npm --prefix functions run test:rules"
import { readFileSync } from 'node:fs';
import { after, afterEach, before, describe, it } from 'node:test';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getBytes, ref, uploadString } from 'firebase/storage';

const readRules = (file) => readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');

let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-chat-app-rules',
    firestore: { rules: readRules('firestore.rules') },
    storage: { rules: readRules('storage.rules') },
  });
});

after(() => env.cleanup());

afterEach(async () => {
  await env.clearFirestore();
  await env.clearStorage();
});

const db = (uid) => (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).firestore();
const storage = (uid) => env.authenticatedContext(uid).storage();

/** Writes test data with rules disabled. */
async function seed(write) {
  await env.withSecurityRulesDisabled((context) => write(context.firestore(), context.storage()));
}

const story = (overrides = {}) => ({
  ownerId: 'alice',
  ownerName: 'Alice',
  imageUrl: 'https://img',
  storagePath: 'stories/alice/s1/image.jpg',
  caption: '',
  visibility: 'friends',
  viewerIds: ['alice'],
  ...overrides,
});

describe('existing chat collections', () => {
  it('lets a member read their rooms and send messages as themselves', async () => {
    await seed((admin) => setDoc(doc(admin, 'rooms/r1'), { type: 'direct', userIds: ['alice', 'bob'] }));
    await assertSucceeds(
      getDocs(query(collection(db('alice'), 'rooms'), where('userIds', 'array-contains', 'alice'))),
    );
    await assertSucceeds(setDoc(doc(db('alice'), 'rooms/r1/messages/m1'), { authorId: 'alice', text: 'hi' }));
    await assertFails(setDoc(doc(db('alice'), 'rooms/r1/messages/m2'), { authorId: 'bob', text: 'hi' }));
  });

  it("keeps non-members out of a room and its messages", async () => {
    await seed((admin) => setDoc(doc(admin, 'rooms/r1'), { type: 'direct', userIds: ['alice', 'bob'] }));
    await assertFails(getDoc(doc(db('carol'), 'rooms/r1')));
    await assertFails(getDocs(collection(db('carol'), 'rooms/r1/messages')));
  });

  it('requires sign-in', async () => {
    await assertFails(getDoc(doc(db(null), 'users/alice')));
  });
});

describe('profileData', () => {
  it("doesn't let users change their own snap count", async () => {
    await seed((admin) =>
      setDoc(doc(admin, 'profileData/alice'), { userName: 'a', first: 'A', last: 'B', snapCount: 2 }),
    );
    await assertSucceeds(updateDoc(doc(db('alice'), 'profileData/alice'), { first: 'Al' }));
    await assertSucceeds(updateDoc(doc(db('alice'), 'profileData/alice'), { locationSharing: 'always' }));
    await assertFails(updateDoc(doc(db('alice'), 'profileData/alice'), { snapCount: 99 }));
    await assertFails(updateDoc(doc(db('alice'), 'profileData/alice'), { locationSharing: 'sometimes' }));
    await assertFails(setDoc(doc(db('bob'), 'profileData/bob'), { userName: 'b', first: 'B', last: 'B', snapCount: 5 }));
  });
});

describe('stories', () => {
  it('lets the owner create a story only with themselves as the sole viewer', async () => {
    await assertSucceeds(setDoc(doc(db('alice'), 'stories/s1'), story()));
    await assertFails(setDoc(doc(db('alice'), 'stories/s2'), story({ viewerIds: ['alice', 'bob'], storagePath: 'stories/alice/s2/image.jpg' })));
    await assertFails(setDoc(doc(db('bob'), 'stories/s3'), story({ storagePath: 'stories/alice/s3/image.jpg' })));
  });

  it('shows friends-only stories to viewers only, and public stories to everyone', async () => {
    await seed(async (admin) => {
      await setDoc(doc(admin, 'stories/s1'), story({ viewerIds: ['alice', 'bob'] }));
      await setDoc(doc(admin, 'stories/s2'), story({ visibility: 'everyone', storagePath: 'stories/alice/s2/image.jpg' }));
    });
    await assertSucceeds(getDoc(doc(db('bob'), 'stories/s1')));
    await assertFails(getDoc(doc(db('carol'), 'stories/s1')));
    await assertSucceeds(getDoc(doc(db('carol'), 'stories/s2')));
  });

  it('allows the feed queries the app runs', async () => {
    await assertSucceeds(
      getDocs(query(collection(db('bob'), 'stories'), where('viewerIds', 'array-contains', 'bob'))),
    );
    await assertSucceeds(
      getDocs(
        query(
          collection(db('bob'), 'stories'),
          where('visibility', '==', 'everyone'),
          where('ownerId', 'in', ['alice']),
        ),
      ),
    );
    await assertFails(getDocs(query(collection(db('bob'), 'stories'), where('ownerId', '==', 'alice'))));
  });

  it('lets the owner change visibility but not viewers', async () => {
    await seed((admin) => setDoc(doc(admin, 'stories/s1'), story({ viewerIds: ['alice', 'bob'] })));
    await assertSucceeds(updateDoc(doc(db('alice'), 'stories/s1'), { visibility: 'everyone' }));
    await assertFails(updateDoc(doc(db('alice'), 'stories/s1'), { viewerIds: ['alice', 'carol'] }));
    await assertFails(updateDoc(doc(db('bob'), 'stories/s1'), { visibility: 'everyone' }));
    await assertFails(deleteDoc(doc(db('bob'), 'stories/s1')));
    await assertSucceeds(deleteDoc(doc(db('alice'), 'stories/s1')));
  });
});

describe('snaps', () => {
  const snap = {
    batchId: 'b1',
    senderId: 'alice',
    senderName: 'Alice',
    recipientId: 'bob',
    storagePath: 'snaps/alice/b1/image.jpg',
  };

  it('lets a sender create a snap keyed by batch and recipient', async () => {
    await assertSucceeds(setDoc(doc(db('alice'), 'snaps/b1_bob'), snap));
    await assertFails(setDoc(doc(db('alice'), 'snaps/other'), snap));
    await assertFails(setDoc(doc(db('carol'), 'snaps/b1_bob'), snap));
    await assertFails(setDoc(doc(db('alice'), 'snaps/b1_alice'), { ...snap, recipientId: 'alice' }));
  });

  it('lets only the recipient read and open (delete) it', async () => {
    await seed((admin) => setDoc(doc(admin, 'snaps/b1_bob'), snap));
    await assertFails(getDoc(doc(db('alice'), 'snaps/b1_bob')));
    await assertFails(getDoc(doc(db('carol'), 'snaps/b1_bob')));
    await assertSucceeds(
      getDocs(query(collection(db('bob'), 'snaps'), where('recipientId', '==', 'bob'))),
    );
    await assertFails(deleteDoc(doc(db('alice'), 'snaps/b1_bob')));
    await assertSucceeds(deleteDoc(doc(db('bob'), 'snaps/b1_bob')));
  });

  it("lets the recipient download the photo until they've opened it", async () => {
    await assertSucceeds(
      uploadString(ref(storage('alice'), 'snaps/alice/b1/image.jpg'), 'x', 'raw', { contentType: 'image/jpeg' }),
    );
    await seed((admin) => setDoc(doc(admin, 'snaps/b1_bob'), snap));
    await assertSucceeds(getBytes(ref(storage('bob'), 'snaps/alice/b1/image.jpg')));
    await assertFails(getBytes(ref(storage('carol'), 'snaps/alice/b1/image.jpg')));
  });
});

describe('memories', () => {
  it('are private to their owner', async () => {
    await assertSucceeds(setDoc(doc(db('alice'), 'memories/alice/items/m1'), { imageUrl: 'x', storagePath: 'y' }));
    await assertFails(getDoc(doc(db('bob'), 'memories/alice/items/m1')));
    await assertFails(setDoc(doc(db('bob'), 'memories/alice/items/m2'), { imageUrl: 'x', storagePath: 'y' }));
  });
});

describe('locations', () => {
  it('are created visible only to the owner and readable by viewers', async () => {
    await assertSucceeds(setDoc(doc(db('alice'), 'locations/alice'), { latitude: 1, longitude: 2, viewerIds: ['alice'] }));
    await assertFails(setDoc(doc(db('bob'), 'locations/bob'), { latitude: 1, longitude: 2, viewerIds: ['bob', 'alice'] }));

    await seed((admin) => updateDoc(doc(admin, 'locations/alice'), { viewerIds: ['alice', 'bob'] }));
    await assertSucceeds(
      getDocs(query(collection(db('bob'), 'locations'), where('viewerIds', 'array-contains', 'bob'))),
    );
    await assertFails(getDoc(doc(db('carol'), 'locations/alice')));
  });

  it("don't let the owner change who can see them", async () => {
    await seed((admin) => setDoc(doc(admin, 'locations/alice'), { latitude: 1, longitude: 2, viewerIds: ['alice', 'bob'] }));
    await assertSucceeds(updateDoc(doc(db('alice'), 'locations/alice'), { latitude: 3 }));
    await assertFails(updateDoc(doc(db('alice'), 'locations/alice'), { viewerIds: ['alice', 'carol'] }));
    await assertSucceeds(deleteDoc(doc(db('alice'), 'locations/alice')));
  });
});

describe('following', () => {
  it('lets users follow others but not on behalf of someone else', async () => {
    await assertSucceeds(setDoc(doc(db('alice'), 'following/alice/users/bob'), { createdAt: 1 }));
    await assertFails(setDoc(doc(db('alice'), 'following/bob/users/carol'), { createdAt: 1 }));
    await assertFails(setDoc(doc(db('alice'), 'following/alice/users/alice'), { createdAt: 1 }));
  });
});

describe('console-managed content', () => {
  it('is read-only', async () => {
    await assertSucceeds(getDocs(collection(db('alice'), 'news')));
    await assertFails(setDoc(doc(db('alice'), 'news/n1'), { title: 'x' }));
    await assertFails(setDoc(doc(db('alice'), 'subscriptions/s1'), { label: 'x' }));
  });
});

describe('storage uploads', () => {
  it('only accept images into the uploader’s own folders', async () => {
    await assertSucceeds(
      uploadString(ref(storage('alice'), 'avatars/alice/1.jpg'), 'x', 'raw', { contentType: 'image/jpeg' }),
    );
    await assertFails(
      uploadString(ref(storage('alice'), 'avatars/bob/1.jpg'), 'x', 'raw', { contentType: 'image/jpeg' }),
    );
    await assertFails(
      uploadString(ref(storage('alice'), 'avatars/alice/1.txt'), 'x', 'raw', { contentType: 'text/plain' }),
    );
  });
});
