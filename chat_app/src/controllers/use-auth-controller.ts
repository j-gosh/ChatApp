import type { User } from '@react-native-firebase/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { userProfileQueryKey } from '@/hooks/user/use-user-profile';
import { useServices, type Services } from '@/providers/ServicesProvider';
import { stopBackgroundLocationSharing } from '@/services/location-task';
import { useChatStore } from '@/stores/chat-store';
import { withTimeout } from '@/utils/async';

// Sign-out shouldn't hang on removing the shared location while offline.
const STOP_SHARING_TIMEOUT_MS = 5_000;

/** Stops sharing the user's location before they sign out. Failures are logged, not thrown. */
async function stopLocationSharing({ authService, locationService }: Services) {
  const uid = authService.currentUser?.uid;
  const results = await Promise.allSettled([
    stopBackgroundLocationSharing(),
    uid ? withTimeout(locationService.stopSharing(uid), STOP_SHARING_TIMEOUT_MS) : undefined,
  ]);
  for (const result of results) {
    if (result.status === 'rejected') {
      console.warn('[auth] Could not stop location sharing on sign out', result.reason);
    }
  }
}

/** Thrown when the account was created but its Firestore documents could not be written. */
export class ProfileSetupError extends Error {
  constructor(cause: unknown) {
    super("Your account was created, but we couldn't finish setting up your profile.", { cause });
    this.name = 'ProfileSetupError';
  }
}

export interface SignUpInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userName?: string;
}

function splitDisplayName(displayName: string | null): [string, string] | null {
  const [firstName, ...rest] = (displayName ?? '').trim().split(/\s+/);
  return firstName ? [firstName, rest.join(' ')] : null;
}

/**
 * Creates the profile and chat-user documents for `user` if they are missing,
 * e.g. when sign-up was interrupted after the auth account was created.
 */
async function ensureUserDocuments({ chatService, userService }: Services, user: User) {
  if (await userService.getUserProfile(user.uid)) return;

  const names = splitDisplayName(user.displayName);
  if (!names) {
    console.warn('[auth] Profile missing and no display name to rebuild it from', user.uid);
    return;
  }
  const [firstName, lastName] = names;
  await Promise.all([
    chatService.createUserInFirestore({ id: user.uid, firstName, lastName }),
    userService.saveUserProfile(user.uid, `${firstName}_${lastName}`, firstName, lastName),
  ]);
}

/**
 * Authentication business logic. Delegates Firebase calls to the services so
 * screens stay free of SDK-specific code.
 */
export function useAuthController() {
  const services = useServices();
  const queryClient = useQueryClient();

  return useMemo(() => {
    const { authService, chatService, userService } = services;

    return {
      async signIn(email: string, password: string): Promise<void> {
        const { user } = await authService.signInWithEmailAndPassword(email, password);
        try {
          await ensureUserDocuments(services, user);
        } catch (error) {
          // Signing in still succeeded; the profile screen surfaces the missing profile.
          console.error('[auth] Failed to repair user documents', error);
        }
      },

      /**
       * Creates the account, then the chat user and profile documents.
       * @throws {ProfileSetupError} if the account exists but its documents could not be saved.
       */
      async signUp({ email, password, firstName, lastName, userName }: SignUpInput): Promise<void> {
        const { user } = await authService.createUserWithEmailAndPassword(email, password);
        try {
          await authService.updateDisplayName(user, `${firstName} ${lastName}`);
          await Promise.all([
            chatService.createUserInFirestore({ id: user.uid, firstName, lastName }),
            userName
              ? userService.saveUserProfile(user.uid, userName, firstName, lastName)
              : undefined,
          ]);
        } catch (error) {
          console.error('[auth] Failed to set up new user documents', error);
          throw new ProfileSetupError(error);
        } finally {
          // Screens may have loaded the (then missing) profile as soon as auth state changed.
          await queryClient.invalidateQueries({ queryKey: userProfileQueryKey(user.uid) });
        }
      },

      /** Recreates the signed-in user's missing profile documents from their account name. */
      async repairProfile(user: User): Promise<void> {
        await ensureUserDocuments(services, user);
        await queryClient.invalidateQueries({ queryKey: userProfileQueryKey(user.uid) });
      },

      sendPasswordReset(email: string): Promise<void> {
        return authService.sendPasswordResetEmail(email);
      },

      async signOut(): Promise<void> {
        await stopLocationSharing(services);
        await authService.signOut();
        useChatStore.getState().clearSelectedRoom();
        queryClient.clear();
      },
    };
  }, [services, queryClient]);
}
