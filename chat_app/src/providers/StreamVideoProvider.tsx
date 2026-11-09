import { StreamVideo, StreamVideoClient } from '@stream-io/video-react-native-sdk';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { streamApiKey } from '@/config';
import { CallOverlay } from '@/features/video-chat/CallOverlay';
import { useSignedInUser } from '@/providers/AuthStateProvider';
import { useServices } from '@/providers/ServicesProvider';
import { toError } from '@/services/observer';

export type VideoClientState =
  | { status: 'connecting' }
  | { status: 'connected'; client: StreamVideoClient }
  | { status: 'error'; error: Error };

interface VideoClientContextValue {
  state: VideoClientState;
  /** Reconnects after an error. */
  retry: () => void;
}

const VideoClientContext = createContext<VideoClientContextValue | null>(null);

type Settled = { attempt: number } & Exclude<VideoClientState, { status: 'connecting' }>;

const notConfigured: VideoClientState = {
  status: 'error',
  error: new Error("Video calling isn't configured for this build."),
};

/**
 * Connects the signed-in user to Stream Video for as long as they are signed in,
 * and shows incoming and outgoing calls over every screen.
 */
export function StreamVideoProvider({ children }: { children: ReactNode }) {
  const user = useSignedInUser();
  const { videoService } = useServices();
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled | null>(null);

  useEffect(() => {
    if (!streamApiKey) return;

    let cancelled = false;
    const client = new StreamVideoClient({ apiKey: streamApiKey });
    client
      .connectUser({ id: user.uid, name: user.displayName ?? undefined }, () =>
        videoService.getUserToken(),
      )
      .then(() => {
        if (!cancelled) setSettled({ attempt, status: 'connected', client });
      })
      .catch((error: unknown) => {
        console.error('[video] Failed to connect to Stream', error);
        if (!cancelled) setSettled({ attempt, status: 'error', error: toError(error) });
      });

    return () => {
      cancelled = true;
      client.disconnectUser().catch((error: unknown) => {
        console.warn('[video] Failed to disconnect from Stream', error);
      });
    };
  }, [user.uid, user.displayName, videoService, attempt]);

  const state: VideoClientState = !streamApiKey
    ? notConfigured
    : settled?.attempt === attempt
      ? settled
      : { status: 'connecting' };

  return (
    <VideoClientContext.Provider value={{ state, retry: () => setAttempt((count) => count + 1) }}>
      {children}
      {state.status === 'connected' ? (
        <StreamVideo client={state.client}>
          <CallOverlay />
        </StreamVideo>
      ) : null}
    </VideoClientContext.Provider>
  );
}

export function useVideoClient(): VideoClientContextValue {
  const value = useContext(VideoClientContext);
  if (!value) throw new Error('useVideoClient must be used within a StreamVideoProvider');
  return value;
}
