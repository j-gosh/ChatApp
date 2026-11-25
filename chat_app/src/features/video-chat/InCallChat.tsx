import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { IconButton, Text, TextInput } from 'react-native-paper';

import { colors } from '@/theme/app-theme';

interface LocalMessage {
  id: string;
  text: string;
}

/**
 * Simple text panel shown alongside a video call. Messages are kept in memory
 * on this device only.
 */
export function InCallChat() {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<LocalMessage[]>([]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((current) => [...current, { id: `${Date.now()}-${current.length}`, text }]);
    setDraft('');
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(message) => message.id}
        renderItem={({ item }) => (
          <View style={styles.bubble}>
            <Text>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
      <View style={styles.inputRow}>
        <TextInput
          mode="outlined"
          dense
          style={styles.input}
          placeholder="Type a message..."
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <IconButton icon="send" iconColor={colors.primary} onPress={send} accessibilityLabel="Send" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  list: { padding: 8, gap: 8 },
  bubble: {
    alignSelf: 'flex-start',
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.primaryContainer,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 8, gap: 8 },
  input: { flex: 1 },
});
