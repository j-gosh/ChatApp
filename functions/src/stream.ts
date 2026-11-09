import { StreamClient } from '@stream-io/node-sdk';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

const streamApiKey = defineSecret('STREAM_API_KEY');
const streamApiSecret = defineSecret('STREAM_API_SECRET');

const TOKEN_VALIDITY_SECONDS = 60 * 60;

/** The caller's name for Stream: their profile name, falling back to their auth display name. */
async function getDisplayName(uid: string): Promise<string | undefined> {
  const profile = await getFirestore().doc(`profileData/${uid}`).get();
  const first: unknown = profile.get('first');
  const last: unknown = profile.get('last');
  if (typeof first === 'string' && first.length > 0) {
    return [first, typeof last === 'string' ? last : ''].join(' ').trim();
  }
  const user = await getAuth().getUser(uid);
  return user.displayName ?? undefined;
}

/**
 * Issues a Stream Video token for the signed-in caller and registers them as a
 * Stream user, so friends can ring them. The Stream secret never leaves the server.
 */
export const getStreamUserToken = onCall(
  { secrets: [streamApiKey, streamApiSecret] },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError('unauthenticated', 'Sign in to use video calls.');
    }

    try {
      const client = new StreamClient(streamApiKey.value(), streamApiSecret.value());
      await client.upsertUsers([{ id: uid, name: await getDisplayName(uid) }]);
      const token = client.generateUserToken({
        user_id: uid,
        validity_in_seconds: TOKEN_VALIDITY_SECONDS,
      });
      return { token };
    } catch (error) {
      logger.error('Failed to issue Stream token', { uid, error });
      throw new HttpsError('internal', 'Could not issue a video token.');
    }
  },
);
