import { FieldValue, getFirestore, type DocumentSnapshot } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { onDocumentCreated, onDocumentWritten } from 'firebase-functions/v2/firestore';

// Friends-only content (stories, locations) carries `viewerIds`: the owner plus
// everyone on the owner's friends list. Firestore rules check it, and clients
// can only create it as `[ownerId]`, so these triggers keep it in sync.

const BATCH_LIMIT = 500;

function friendIdOf(snapshot: DocumentSnapshot): string {
  const id: unknown = snapshot.get('id');
  return typeof id === 'string' && id.length > 0 ? id : snapshot.id;
}

async function getFriendIds(uid: string): Promise<string[]> {
  const friends = await getFirestore().collection(`userFriendsList/${uid}/friends`).get();
  return [...new Set(friends.docs.map(friendIdOf))];
}

/** True if `friendId` is still on `uid`'s friends list (old lists can hold duplicates). */
async function isStillFriend(uid: string, friendId: string): Promise<boolean> {
  const friends = getFirestore().collection(`userFriendsList/${uid}/friends`);
  const [byDocId, byField] = await Promise.all([
    friends.doc(friendId).get(),
    friends.where('id', '==', friendId).limit(1).get(),
  ]);
  return byDocId.exists || !byField.empty;
}

/** Applies `update` to every story owned by `uid` and to their location, if any. */
async function updateAudience(uid: string, update: FieldValue): Promise<void> {
  const db = getFirestore();
  const stories = await db.collection('stories').where('ownerId', '==', uid).get();
  for (let start = 0; start < stories.docs.length; start += BATCH_LIMIT) {
    const batch = db.batch();
    for (const story of stories.docs.slice(start, start + BATCH_LIMIT)) {
      batch.update(story.ref, { viewerIds: update });
    }
    await batch.commit();
  }

  const location = db.doc(`locations/${uid}`);
  if ((await location.get()).exists) {
    await location.update({ viewerIds: update });
  }
}

/** Grants or revokes a friend's access to the owner's friends-only content. */
export const onFriendWritten = onDocumentWritten(
  'userFriendsList/{uid}/friends/{docId}',
  async (event) => {
    const { uid } = event.params;
    const before = event.data?.before;
    const after = event.data?.after;

    if (after?.exists && !before?.exists) {
      const friendId = friendIdOf(after);
      await updateAudience(uid, FieldValue.arrayUnion(friendId));
    } else if (before?.exists && !after?.exists) {
      const friendId = friendIdOf(before);
      if (await isStillFriend(uid, friendId)) return;
      await updateAudience(uid, FieldValue.arrayRemove(friendId));
    }
  },
);

async function addFriendsAsViewers(path: string, ownerId: unknown): Promise<void> {
  if (typeof ownerId !== 'string') {
    logger.warn('Cannot set viewers: document has no owner', { path });
    return;
  }
  const friendIds = await getFriendIds(ownerId);
  if (friendIds.length === 0) return;
  await getFirestore()
    .doc(path)
    .update({ viewerIds: FieldValue.arrayUnion(...friendIds) });
}

export const onStoryCreated = onDocumentCreated('stories/{storyId}', async (event) => {
  if (!event.data) return;
  await addFriendsAsViewers(event.data.ref.path, event.data.get('ownerId'));
});

export const onLocationCreated = onDocumentCreated('locations/{uid}', async (event) => {
  if (!event.data) return;
  await addFriendsAsViewers(event.data.ref.path, event.params.uid);
});
