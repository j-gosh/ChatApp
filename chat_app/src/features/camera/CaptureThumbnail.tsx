import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, View } from 'react-native';

export type Capture = { type: 'photo' | 'video'; uri: string };

function VideoThumbnail({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
    videoPlayer.play();
  });
  return (
    <VideoView player={player} style={styles.media} contentFit="cover" nativeControls={false} />
  );
}

/** Small preview of the last captured photo, or a looping preview of the last video. */
export function CaptureThumbnail({ capture }: { capture: Capture | null }) {
  if (!capture) return <View style={styles.container} />;

  return (
    <View style={[styles.container, capture.type === 'video' && styles.videoBorder]}>
      {capture.type === 'photo' ? (
        <Image source={{ uri: capture.uri }} style={styles.media} contentFit="cover" />
      ) : (
        <VideoThumbnail uri={capture.uri} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 64, height: 64, borderRadius: 4, overflow: 'hidden' },
  videoBorder: { borderWidth: 2, borderColor: '#E91E63' },
  media: { flex: 1 },
});
