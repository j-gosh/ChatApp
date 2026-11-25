import type { User, UserCredential } from '@react-native-firebase/auth';

import { mockData, type MockAccount } from '@/mock-data';
import type { AuthService } from '@/services/auth-service';
import { firebaseError } from '@/services/mock/mock-utils';
import type { Unsubscribe } from '@/services/observer';

// Firebase Auth's minimum password length.
const MIN_PASSWORD_LENGTH = 6;

/** A Firebase user with just the fields the app reads. */
function toUser({
  uid,
  email,
  displayName,
  photoURL,
}: Pick<MockAccount, 'uid' | 'email' | 'displayName' | 'photoURL'>): User {
  return { uid, email, displayName, photoURL, emailVerified: true, isAnonymous: false } as User;
}

function findAccount(email: string): MockAccount | undefined {
  const normalized = email.trim().toLowerCase();
  return mockData.accounts.find((account) => account.email.toLowerCase() === normalized);
}

/**
 * {@link AuthService} that signs in against `src/mock-data/auth-accounts.json`.
 * Auth state is kept in memory; profile updates are no-ops (mock data is read-only).
 */
export class MockAuthService implements AuthService {
  private user: User | null = null;
  private readonly listeners = new Set<(user: User | null) => void>();

  get currentUser(): User | null {
    return this.user;
  }

  onAuthStateChanged(listener: (user: User | null) => void): Unsubscribe {
    this.listeners.add(listener);
    // Like Firebase, report the current state right after subscribing.
    const timer = setTimeout(() => listener(this.user), 0);
    return () => {
      clearTimeout(timer);
      this.listeners.delete(listener);
    };
  }

  async signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
    const account = findAccount(email);
    if (!account) throw firebaseError('auth/user-not-found', 'No mock account for that email.');
    if (account.disabled) throw firebaseError('auth/user-disabled', 'This account is disabled.');
    if (account.password !== password) {
      throw firebaseError('auth/invalid-credential', 'Incorrect email or password.');
    }
    return this.signInAs(toUser(account));
  }

  async createUserWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
    if (findAccount(email)) {
      throw firebaseError('auth/email-already-in-use', 'A mock account already uses that email.');
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw firebaseError('auth/weak-password', 'Password is too short.');
    }
    // Not saved: the new user exists until sign-out or reload and has no profile.
    return this.signInAs(
      toUser({ uid: `mock-${Date.now()}`, email: email.trim(), displayName: null, photoURL: null }),
    );
  }

  async updateDisplayName(): Promise<void> {}

  async updatePhotoUrl(): Promise<void> {}

  async sendPasswordResetEmail(): Promise<void> {}

  async signOut(): Promise<void> {
    this.setUser(null);
  }

  private signInAs(user: User): UserCredential {
    this.setUser(user);
    return { user } as UserCredential;
  }

  private setUser(user: User | null): void {
    this.user = user;
    this.listeners.forEach((listener) => listener(user));
  }
}
