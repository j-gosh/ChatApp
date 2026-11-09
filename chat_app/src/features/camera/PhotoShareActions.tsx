import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';

import { useMediaController } from '@/controllers/use-media-controller';
import { PostStoryDialog } from '@/features/camera/PostStoryDialog';
import { SnapRecipientsDialog } from '@/features/camera/SnapRecipientsDialog';
import { useUserFriends } from '@/hooks/user/use-user-friends';
import type { StoryVisibility } from '@/models/story';
import { useSignedInUser } from '@/providers/AuthStateProvider';
import { showSnackbar } from '@/stores/snackbar-store';
import { getDataErrorMessage } from '@/utils/errors';

type Dialog = 'snap' | 'story' | null;

function reportFailure(action: string) {
  return (error: unknown) => {
    console.error(`[camera] ${action} failed`, error);
    showSnackbar(`${action} failed: ${getDataErrorMessage(error)}`);
  };
}

/** Actions for the last captured photo: send it as a snap, post it as a story, or save it. */
export function PhotoShareActions({ uri }: { uri: string }) {
  const { uid } = useSignedInUser();
  const mediaController = useMediaController();
  const friends = useUserFriends(uid);
  const [dialog, setDialog] = useState<Dialog>(null);

  // On failure the dialog stays open and the photo is kept, so the user can retry.
  const sendSnap = useMutation({
    mutationFn: (recipientIds: string[]) => mediaController.sendSnap(uri, recipientIds),
    onSuccess: (_result, recipientIds) => {
      setDialog(null);
      showSnackbar(
        recipientIds.length === 1 ? 'Snap sent.' : `Snap sent to ${recipientIds.length} friends.`,
      );
    },
    onError: reportFailure('Sending the snap'),
  });

  const postStory = useMutation({
    mutationFn: ({ caption, visibility }: { caption: string; visibility: StoryVisibility }) =>
      mediaController.postStory(uri, caption, visibility),
    onSuccess: () => {
      setDialog(null);
      showSnackbar('Story posted.');
    },
    onError: reportFailure('Posting the story'),
  });

  const saveMemory = useMutation({
    mutationFn: () => mediaController.saveMemory(uri),
    onSuccess: () => showSnackbar('Saved to memories.'),
    onError: reportFailure('Saving the memory'),
  });

  return (
    <View style={styles.row}>
      <Button compact icon="send" onPress={() => setDialog('snap')} disabled={sendSnap.isPending}>
        Send snap
      </Button>
      <Button
        compact
        icon="plus-circle-outline"
        onPress={() => setDialog('story')}
        disabled={postStory.isPending}
      >
        Post story
      </Button>
      <Button
        compact
        icon="bookmark-outline"
        onPress={() => saveMemory.mutate()}
        loading={saveMemory.isPending}
        disabled={saveMemory.isPending}
      >
        Save
      </Button>

      <SnapRecipientsDialog
        visible={dialog === 'snap'}
        friends={friends.data ?? []}
        isSending={sendSnap.isPending}
        onDismiss={() => setDialog(null)}
        onSend={(recipientIds) => sendSnap.mutate(recipientIds)}
      />
      <PostStoryDialog
        visible={dialog === 'story'}
        isPosting={postStory.isPending}
        onDismiss={() => setDialog(null)}
        onPost={(caption, visibility) => postStory.mutate({ caption, visibility })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-evenly', paddingVertical: 4 },
});
