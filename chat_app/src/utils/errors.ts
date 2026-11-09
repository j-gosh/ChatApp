const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'An account already exists for that email.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/invalid-email': 'Please enter a valid email.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account found for that email.',
  'auth/weak-password': 'Password must be at least 8 characters.',
  'auth/wrong-password': 'Incorrect email or password.',
};

// Storage and Firestore failures the user can act on (upload, post, send, follow…).
const DATA_ERROR_MESSAGES: Record<string, string> = {
  'storage/canceled': 'The upload was cancelled.',
  'storage/quota-exceeded': 'Storage is full. Please try again later.',
  'storage/retry-limit-exceeded': 'Network error. Check your connection and try again.',
  'storage/unauthorized': "You don't have permission to do that.",
  'storage/unauthenticated': 'Please sign in again.',
  'firestore/permission-denied': "You don't have permission to do that.",
  'firestore/unavailable': "You're offline. Check your connection and try again.",
  'firestore/unauthenticated': 'Please sign in again.',
};

const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';

function getErrorCode(error: unknown): string | undefined {
  if (error !== null && typeof error === 'object' && 'code' in error) {
    return typeof error.code === 'string' ? error.code : undefined;
  }
  return undefined;
}

/** Maps a Firebase Auth error to a message suitable for showing to the user. */
export function getAuthErrorMessage(error: unknown): string {
  const code = getErrorCode(error);
  return (code && AUTH_ERROR_MESSAGES[code]) ?? DEFAULT_MESSAGE;
}

/** Maps a Firebase Storage or Firestore error to a message suitable for showing to the user. */
export function getDataErrorMessage(error: unknown): string {
  const code = getErrorCode(error);
  return (code && DATA_ERROR_MESSAGES[code]) ?? DEFAULT_MESSAGE;
}

/** A user-facing message for any unexpected error. */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : DEFAULT_MESSAGE;
}
