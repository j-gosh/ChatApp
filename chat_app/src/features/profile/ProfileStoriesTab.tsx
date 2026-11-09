import { Alert } from 'react-native';

import { ErrorState } from '@/components/ErrorState';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { useMediaController } from '@/controllers/use-media-controller';
import { ImageGrid } from '@/features/profile/ImageGrid';
import { useOwnStories } from '@/hooks/stories/use-own-stories';
import type { StoryPost } from '@/models/story';
import { showSnackbar } from '@/stores/snackbar-store';
import { getDataErrorMessage } from '@/utils/errors';

/** The user's own stories. Tapping one offers to change who can see it, or delete it. */
export function ProfileStoriesTab({ userId }: { userId: string }) {
  const { data: stories, error, isLoading } = useOwnStories(userId);
  const mediaController = useMediaController();

  const report = (action: string) => (actionError: unknown) => {
    console.error(`[profile] ${action} failed`, actionError);
    showSnackbar(`${action} failed: ${getDataErrorMessage(actionError)}`);
  };

  const confirmDelete = (story: StoryPost) =>
    Alert.alert('Delete story?', 'This removes it for everyone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          mediaController.deleteStory(story.id).catch(report('Deleting the story'));
        },
      },
    ]);

  const showOptions = (story: StoryPost) => {
    const otherVisibility = story.visibility === 'everyone' ? 'friends' : 'everyone';
    Alert.alert(
      'Story',
      story.visibility === 'everyone' ? 'Visible to everyone.' : 'Visible to friends only.',
      [
        {
          text: otherVisibility === 'everyone' ? 'Show to everyone' : 'Friends only',
          onPress: () => {
            mediaController
              .setStoryVisibility(story.id, otherVisibility)
              .catch(report('Changing visibility'));
          },
        },
        { text: 'Delete', style: 'destructive', onPress: () => confirmDelete(story) },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  if (isLoading) return <LoadingAnimation />;
  if (error) return <ErrorState message="Couldn't load your stories." />;

  return (
    <ImageGrid
      items={(stories ?? []).map((story) => ({
        id: story.id,
        uri: story.imageUrl,
        description: story.caption || 'Story photo',
      }))}
      emptyText="No stories yet. Post one from the camera."
      onPressItem={(item) => {
        const story = stories?.find((candidate) => candidate.id === item.id);
        if (story) showOptions(story);
      }}
    />
  );
}
