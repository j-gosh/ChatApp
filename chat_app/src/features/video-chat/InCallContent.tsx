import { CallContent, type CallContentProps } from '@stream-io/video-react-native-sdk';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InCallChat } from '@/features/video-chat/InCallChat';

/** Stream's call UI plus a toggleable in-call text panel. */
export function InCallContent(props: CallContentProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <View style={styles.container}>
      <CallContent {...props} />
      <SafeAreaView style={styles.chatToggle} edges={['top']} pointerEvents="box-none">
        <IconButton
          icon={isChatOpen ? 'close' : 'message-text'}
          mode="contained"
          onPress={() => setIsChatOpen((open) => !open)}
          accessibilityLabel={isChatOpen ? 'Close chat' : 'Open chat'}
        />
      </SafeAreaView>
      {isChatOpen ? (
        <View style={styles.chatPanel}>
          <InCallChat />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  chatToggle: { position: 'absolute', top: 0, right: 8 },
  chatPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '45%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
});
