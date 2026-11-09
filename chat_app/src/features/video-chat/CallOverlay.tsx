import { RingingCallContent, StreamCall, useCalls } from '@stream-io/video-react-native-sdk';
import { useEffect } from 'react';
import { Modal } from 'react-native';

import { InCallContent } from '@/features/video-chat/InCallContent';
import { useSignedInUser } from '@/providers/AuthStateProvider';
import { showSnackbar } from '@/stores/snackbar-store';

/**
 * Full-screen UI for the current ringing call, over any screen: incoming
 * (accept/decline), outgoing (cancel), then the in-call view once joined.
 */
export function CallOverlay() {
  const { uid } = useSignedInUser();
  const ringingCall = useCalls().find((call) => call.ringing);

  useEffect(() => {
    if (!ringingCall?.isCreatedByMe) return;
    return ringingCall.on('call.rejected', (event) => {
      if (event.user.id !== uid) showSnackbar('Call declined.');
    });
  }, [ringingCall, uid]);

  if (!ringingCall) return null;

  return (
    <Modal
      visible
      animationType="slide"
      // Calls end via the hang-up/decline buttons; the back button doesn't drop the call.
      onRequestClose={() => {}}
    >
      <StreamCall call={ringingCall}>
        <RingingCallContent CallContent={InCallContent} />
      </StreamCall>
    </Modal>
  );
}
