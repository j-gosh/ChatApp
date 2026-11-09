import { create } from 'zustand';

import type { StoryVisibility } from '@/models/story';

/** Which sub-page the Chat tab shows: existing conversations, or friends / new conversation. */
export type ChatPage = 'threads' | 'friends';

/** Which list the friends panel shows: the user's friends, or every registered user. */
export type FriendsPage = 'friends' | 'activeUsers';

interface UiState {
  chatPage: ChatPage;
  friendsPage: FriendsPage;
  setChatPage: (page: ChatPage) => void;
  setFriendsPage: (page: FriendsPage) => void;
  /** Visibility preselected when posting a story: the user's last choice. */
  storyVisibility: StoryVisibility;
  setStoryVisibility: (visibility: StoryVisibility) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  chatPage: 'threads',
  friendsPage: 'friends',
  setChatPage: (chatPage) => set({ chatPage }),
  setFriendsPage: (friendsPage) => set({ friendsPage }),
  storyVisibility: 'friends',
  setStoryVisibility: (storyVisibility) => set({ storyVisibility }),
}));
