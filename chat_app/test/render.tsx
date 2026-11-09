import type { User } from '@react-native-firebase/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthStateProvider, SignedInUserProvider } from '@/providers/AuthStateProvider';
import { ServicesProvider } from '@/providers/ServicesProvider';
import { appTheme } from '@/theme/app-theme';
import { createMockServices, type MockServices } from '@test/mock-services';

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

interface Options {
  services?: MockServices;
  /** When set, renders as a signed-in screen for this user. */
  user?: User;
}

export function createTestWrapper({ services = createMockServices(), user }: Options = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    const content = user ? (
      <SignedInUserProvider user={user}>{children}</SignedInUserProvider>
    ) : (
      children
    );
    return (
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <QueryClientProvider client={queryClient}>
          <ServicesProvider services={services}>
            <AuthStateProvider>
              <PaperProvider theme={appTheme}>{content}</PaperProvider>
            </AuthStateProvider>
          </ServicesProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    );
  }

  return { Wrapper, services, queryClient };
}

export async function renderWithProviders(ui: ReactElement, options?: Options) {
  const { Wrapper, services, queryClient } = createTestWrapper(options);
  return { ...(await render(ui, { wrapper: Wrapper })), services, queryClient };
}

export async function renderHookWithProviders<T>(hook: () => T, options?: Options) {
  const { Wrapper, services, queryClient } = createTestWrapper(options);
  return { ...(await renderHook(hook, { wrapper: Wrapper })), services, queryClient };
}
