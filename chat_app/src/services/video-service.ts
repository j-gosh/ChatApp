import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import { z } from 'zod';

const TokenResponseSchema = z.object({ token: z.string().min(1) });

/**
 * Contract for Stream Video authentication.
 *
 * Tokens are signed server-side by the `getStreamUserToken` Cloud Function so the
 * Stream API secret never ships with the app. The concrete implementation is
 * {@link FirebaseVideoService}.
 */
export interface VideoService {
  /** Fetches a fresh Stream Video token for the signed-in user. */
  getUserToken(): Promise<string>;
}

/** Cloud Functions-backed implementation of {@link VideoService}. */
export class FirebaseVideoService implements VideoService {
  private readonly functions = getFunctions();

  async getUserToken(): Promise<string> {
    const getStreamUserToken = httpsCallable(this.functions, 'getStreamUserToken');
    const result = await getStreamUserToken();
    return TokenResponseSchema.parse(result.data).token;
  }
}
