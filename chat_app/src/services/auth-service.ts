import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
  type UserCredential,
} from '@react-native-firebase/auth';

import type { Unsubscribe } from '@/services/observer';

/**
 * Contract for authentication operations.
 *
 * The concrete implementation is {@link FirebaseAuthService}. Coding against this
 * interface keeps the auth layer swappable and independently testable.
 */
export interface AuthService {
  /** The currently signed-in Firebase user, or null. */
  readonly currentUser: User | null;

  /** Calls `listener` with the signed-in user whenever auth state changes. */
  onAuthStateChanged(listener: (user: User | null) => void): Unsubscribe;

  signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential>;

  createUserWithEmailAndPassword(email: string, password: string): Promise<UserCredential>;

  /** Stores the user's full name on the Firebase Auth account. */
  updateDisplayName(user: User, displayName: string): Promise<void>;

  /** Stores the user's profile photo URL on the Firebase Auth account. */
  updatePhotoUrl(user: User, photoURL: string): Promise<void>;

  sendPasswordResetEmail(email: string): Promise<void>;

  signOut(): Promise<void>;
}

/** Firebase-backed implementation of {@link AuthService}. */
export class FirebaseAuthService implements AuthService {
  private readonly auth = getAuth();

  get currentUser(): User | null {
    return this.auth.currentUser;
  }

  onAuthStateChanged(listener: (user: User | null) => void): Unsubscribe {
    return onAuthStateChanged(this.auth, listener);
  }

  signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  createUserWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  updateDisplayName(user: User, displayName: string): Promise<void> {
    return updateProfile(user, { displayName });
  }

  updatePhotoUrl(user: User, photoURL: string): Promise<void> {
    return updateProfile(user, { photoURL });
  }

  sendPasswordResetEmail(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }

  signOut(): Promise<void> {
    return signOut(this.auth);
  }
}
