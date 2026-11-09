import { create } from 'zustand';

import type { Story } from '@/models/story';

interface StoryState {
  /** The story shown in the story viewer. Set before navigating to `/story/[userId]`. */
  selectedStory: Story | null;
  selectStory: (story: Story) => void;
}

export const useStoryStore = create<StoryState>()((set) => ({
  selectedStory: null,
  selectStory: (selectedStory) => set({ selectedStory }),
}));
