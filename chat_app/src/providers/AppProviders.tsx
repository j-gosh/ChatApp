import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { PaperProvider } from 'react-native-paper';

import { SnackbarHost } from '@/components/SnackbarHost';
import { isMockDataEnabled } from '@/config';
import { AuthStateProvider } from '@/providers/AuthStateProvider';
import {
  createFirebaseServices,
  ServicesProvider,
  type Services,
} from '@/providers/ServicesProvider';
import { createMockDataServices } from '@/services/mock';
import { appTheme } from '@/theme/app-theme';

/**
 * Root providers shared by every screen. `services` can be overridden in tests;
 * otherwise debug builds use mock data (see `isMockDataEnabled`).
 */
export function AppProviders({ children, services }: { children: ReactNode; services?: Services }) {
  const [queryClient] = useState(() => new QueryClient());
  const [resolvedServices] = useState(
    () => services ?? (isMockDataEnabled ? createMockDataServices() : createFirebaseServices()),
  );

  return (
    <GestureHandlerRootView style={styles.root}>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <ServicesProvider services={resolvedServices}>
            <AuthStateProvider>
              <PaperProvider theme={appTheme}>
                <BottomSheetModalProvider>
                  {children}
                  <SnackbarHost />
                </BottomSheetModalProvider>
              </PaperProvider>
            </AuthStateProvider>
          </ServicesProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
