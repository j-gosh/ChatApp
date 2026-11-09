import { create } from 'zustand';

interface SnackbarState {
  message: string | null;
  show: (message: string) => void;
  dismiss: () => void;
}

/** App-wide snackbar queue (one at a time), rendered by `SnackbarHost`. */
export const useSnackbarStore = create<SnackbarState>()((set) => ({
  message: null,
  show: (message) => set({ message }),
  dismiss: () => set({ message: null }),
}));

/** Shows a snackbar from anywhere, including outside React components. */
export const showSnackbar = (message: string) => useSnackbarStore.getState().show(message);
