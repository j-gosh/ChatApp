import { useMutation } from '@tanstack/react-query';
import { randomUUID } from 'expo-crypto';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useCameraPermission, useMicrophonePermission } from 'react-native-vision-camera';

import { ErrorState } from '@/components/ErrorState';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { PermissionGate } from '@/components/PermissionGate';
import { getStartCallErrorMessage } from '@/features/video-chat/call-errors';
import { FriendPickerDialog } from '@/features/video-chat/FriendPickerDialog';
import { useUserFriends } from '@/hooks/user/use-user-friends';
import type { ChatUser } from '@/models/chat';
import { useSignedInUser } from '@/providers/AuthStateProvider';
import { useVideoClient } from '@/providers/StreamVideoProvider';
import { showSnackbar } from '@/stores/snackbar-store';
import { palette } from '@/theme/app-theme';

/** Requests camera and microphone access on first visit. */
function useCallPermissions() {
  const camera = useCameraPermission();
  const microphone = useMicrophonePermission();

  const request = async () => {
    try {
      if (!camera.hasPermission) await camera.requestPermission();
      if (!microphone.hasPermission) await microphone.requestPermission();
    } catch (error) {
      console.error('[video] Permission request failed', error);
    }
  };

  const needsRequest =
    (!camera.hasPermission && camera.canRequestPermission) ||
    (!microphone.hasPermission && microphone.canRequestPermission);

  useEffect(() => {
    if (needsRequest) void request();
    // Only ask automatically once, when the screen first appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    granted: camera.hasPermission && microphone.hasPermission,
    canRequest: needsRequest,
    request,
  };
}

/** Video tab: pick a friend and ring them. The call itself shows in the call overlay. */
export function VideoChatScreen() {
  const { uid } = useSignedInUser();
  const permissions = useCallPermissions();
  const { state, retry } = useVideoClient();
  const friends = useUserFriends(uid);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const startCall = useMutation({
    mutationFn: async (friend: ChatUser) => {
      if (state.status !== 'connected') throw new Error('Video calling is not connected');
      const call = state.client.call('default', randomUUID());
      await call.getOrCreate({
        ring: true,
        video: true,
        data: { members: [{ user_id: uid }, { user_id: friend.id }] },
      });
    },
    onSuccess: () => setIsPickerOpen(false),
    onError: (error) => {
      console.error('[video] Failed to start call', error);
      showSnackbar(getStartCallErrorMessage(error));
    },
  });

  if (!permissions.granted) {
    return (
      <PermissionGate
        message="In order to participate in video calls, you need to give access to your camera and microphone while using the app."
        canRequest={permissions.canRequest}
        onRequest={() => void permissions.request()}
      />
    );
  }

  if (state.status === 'connecting') return <LoadingAnimation />;
  if (state.status === 'error') {
    return (
      <ErrorState
        message={`Couldn't connect to video calling. ${state.error.message}`}
        onRetry={retry}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <Text variant="titleMedium">Video chat with your friends</Text>
        <Text style={styles.hint}>Pick a friend to ring their phone.</Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.callButton, pressed && styles.callButtonPressed]}
        onPress={() => setIsPickerOpen(true)}
        accessibilityRole="button"
      >
        <Text style={styles.callButtonText}>Make a video call</Text>
      </Pressable>
      <FriendPickerDialog
        visible={isPickerOpen}
        friends={friends.data ?? []}
        isCalling={startCall.isPending}
        onDismiss={() => setIsPickerOpen(false)}
        onCall={(friend) => startCall.mutate(friend)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  hint: { textAlign: 'center' },
  callButton: {
    margin: 8,
    height: 70,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.amber,
  },
  callButtonPressed: { opacity: 0.8 },
  callButtonText: { fontSize: 20 },
});
