import { create } from 'zustand';

import type { Room } from '@/models/chat';

interface ChatState {
  /** The room shown on the messages screen. Set before navigating to `/messages`. */
  selectedRoom: Room | null;
  selectRoom: (room: Room) => void;
  clearSelectedRoom: () => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  selectedRoom: null,
  selectRoom: (selectedRoom) => set({ selectedRoom }),
  clearSelectedRoom: () => set({ selectedRoom: null }),
}));
