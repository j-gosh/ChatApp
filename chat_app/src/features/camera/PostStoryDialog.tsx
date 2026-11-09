import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Dialog, Portal, SegmentedButtons, Text, TextInput } from 'react-native-paper';

import type { StoryVisibility } from '@/models/story';
import { useUiStore } from '@/stores/ui-store';

const MAX_CAPTION_LENGTH = 120;

/** Dialog for adding a caption and choosing who can see a new story. */
export function PostStoryDialog({
  visible,
  isPosting,
  onDismiss,
  onPost,
}: {
  visible: boolean;
  isPosting: boolean;
  onDismiss: () => void;
  onPost: (caption: string, visibility: StoryVisibility) => void;
}) {
  const [caption, setCaption] = useState('');
  const visibility = useUiStore((state) => state.storyVisibility);
  const setVisibility = useUiStore((state) => state.setStoryVisibility);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Post story</Dialog.Title>
        <Dialog.Content style={styles.content}>
          <TextInput
            mode="outlined"
            label="Caption (optional)"
            value={caption}
            onChangeText={setCaption}
            maxLength={MAX_CAPTION_LENGTH}
          />
          <Text>Who can see it?</Text>
          <SegmentedButtons
            value={visibility}
            onValueChange={(value) => setVisibility(value as StoryVisibility)}
            buttons={[
              { value: 'friends', label: 'Friends' },
              { value: 'everyone', label: 'Everyone' },
            ]}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button
            onPress={() => onPost(caption, visibility)}
            disabled={isPosting}
            loading={isPosting}
          >
            Post
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12 },
});
