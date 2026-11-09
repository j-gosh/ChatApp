import { Snackbar } from 'react-native-paper';

import { useSnackbarStore } from '@/stores/snackbar-store';

export function SnackbarHost() {
  const message = useSnackbarStore((state) => state.message);
  const dismiss = useSnackbarStore((state) => state.dismiss);

  return (
    <Snackbar visible={message !== null} onDismiss={dismiss} duration={4000}>
      {message ?? ''}
    </Snackbar>
  );
}
