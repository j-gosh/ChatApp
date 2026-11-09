import type { User } from '@react-native-firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { useServices } from '@/providers/ServicesProvider';

export interface AuthState {
  /** The signed-in user, or null when signed out. */
  user: User | null;
  /** True until Firebase reports the initial auth state. */
  isLoading: boolean;
}

const AuthStateContext = createContext<AuthState | null>(null);

/**
 * Keeps a single app-wide subscription to Firebase auth state, so routing and
 * screens always agree on who is signed in.
 */
export function AuthStateProvider({ children }: { children: ReactNode }) {
  const { authService } = useServices();
  const [state, setState] = useState<AuthState>({ user: null, isLoading: true });

  useEffect(
    () => authService.onAuthStateChanged((user) => setState({ user, isLoading: false })),
    [authService],
  );

  return <AuthStateContext.Provider value={state}>{children}</AuthStateContext.Provider>;
}

export function useAuthState(): AuthState {
  const state = useContext(AuthStateContext);
  if (!state) throw new Error('useAuthState must be used within an AuthStateProvider');
  return state;
}

const SignedInUserContext = createContext<User | null>(null);

/** Provides the signed-in user to screens that are only reachable while signed in. */
export function SignedInUserProvider({ user, children }: { user: User; children: ReactNode }) {
  return <SignedInUserContext.Provider value={user}>{children}</SignedInUserContext.Provider>;
}

/** The signed-in user. Only valid inside the signed-in route group. */
export function useSignedInUser(): User {
  const user = useContext(SignedInUserContext);
  if (!user) throw new Error('useSignedInUser must be used within a SignedInUserProvider');
  return user;
}
