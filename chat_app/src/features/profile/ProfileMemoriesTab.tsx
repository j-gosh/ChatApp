import { Alert } from 'react-native';

import { ErrorState } from '@/components/ErrorState';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { useMediaController } from '@/controllers/use-media-controller';
import { ImageGrid } from '@/features/profile/ImageGrid';
import { useMemories } from '@/hooks/memories/use-memories';
import { showSnackbar } from '@/stores/snackbar-store';
import { getDataErrorMessage } from '@/utils/errors';

/** The user's private memories. Tapping one offers to delete it. */
export function ProfileMemoriesTab({ userId }: { userId: string }) {
  const { data: memories, error, isLoading } = useMemories(userId);
  const mediaController = useMediaController();

  const confirmDelete = (memoryId: string) =>
    Alert.alert('Delete memory?', "This can't be undone.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          mediaController.deleteMemory(memoryId).catch((deleteError: unknown) => {
            console.error('[profile] Deleting a memory failed', deleteError);
            showSnackbar(`Deleting the memory failed: ${getDataErrorMessage(deleteError)}`);
          });
        },
      },
    ]);

  if (isLoading) return <LoadingAnimation />;
  if (error) return <ErrorState message="Couldn't load your memories." />;

  return (
    <ImageGrid
      items={(memories ?? []).map((memory) => ({
        id: memory.id,
        uri: memory.imageUrl,
        description: 'Memory photo',
      }))}
      emptyText="No memories yet. Save one from the camera."
      onPressItem={(item) => confirmDelete(item.id)}
    />
  );
}
