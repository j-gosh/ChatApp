import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Checkbox, Dialog, Portal, Text } from 'react-native-paper';

import { getUserDisplayName, type ChatUser } from '@/models/chat';

/** Dialog for choosing which friends to send a snap to. */
export function SnapRecipientsDialog({
  visible,
  friends,
  isSending,
  onDismiss,
  onSend,
}: {
  visible: boolean;
  friends: ChatUser[];
  isSending: boolean;
  onDismiss: () => void;
  onSend: (recipientIds: string[]) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selected) => selected !== id) : [...current, id],
    );

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Send snap</Dialog.Title>
        <Dialog.Content>
          <Text>It disappears after they open it.</Text>
        </Dialog.Content>
        <Dialog.ScrollArea style={styles.scrollArea}>
          <ScrollView>
            {friends.length === 0 ? (
              <Text style={styles.empty}>Add friends from the Chat tab to send them snaps.</Text>
            ) : (
              friends.map((friend) => (
                <Checkbox.Item
                  key={friend.id}
                  label={getUserDisplayName(friend) || 'Unnamed friend'}
                  status={selectedIds.includes(friend.id) ? 'checked' : 'unchecked'}
                  onPress={() => toggle(friend.id)}
                />
              ))
            )}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button
            onPress={() => onSend(selectedIds)}
            disabled={selectedIds.length === 0 || isSending}
            loading={isSending}
          >
            Send
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  scrollArea: { maxHeight: 320 },
  empty: { padding: 16 },
});
