import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Dialog, Portal, RadioButton, Text } from 'react-native-paper';

import { getUserDisplayName, type ChatUser } from '@/models/chat';

/** Dialog for choosing which friend to video call. */
export function FriendPickerDialog({
  visible,
  friends,
  isCalling,
  onDismiss,
  onCall,
}: {
  visible: boolean;
  friends: ChatUser[];
  isCalling: boolean;
  onDismiss: () => void;
  onCall: (friend: ChatUser) => void;
}) {
  const [selectedId, setSelectedId] = useState<string>();
  const selectedFriend = friends.find((friend) => friend.id === selectedId);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Make a video call?</Dialog.Title>
        <Dialog.Content>
          <Text>Select a friend you want to video call</Text>
        </Dialog.Content>
        <Dialog.ScrollArea style={styles.scrollArea}>
          <ScrollView>
            {friends.length === 0 ? (
              <Text style={styles.empty}>Add friends from the Chat tab to call them.</Text>
            ) : (
              <RadioButton.Group value={selectedId ?? ''} onValueChange={setSelectedId}>
                {friends.map((friend) => (
                  <RadioButton.Item
                    key={friend.id}
                    value={friend.id}
                    label={getUserDisplayName(friend) || 'Unnamed friend'}
                  />
                ))}
              </RadioButton.Group>
            )}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button
            disabled={!selectedFriend || isCalling}
            loading={isCalling}
            onPress={() => selectedFriend && onCall(selectedFriend)}
          >
            Call
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  scrollArea: { maxHeight: 250, paddingHorizontal: 0 },
  empty: { padding: 24, textAlign: 'center' },
});
