import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, IconButton, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMediaController } from '@/controllers/use-media-controller';
import { useServices } from '@/providers/ServicesProvider';

/**
 * Full-screen view of a received snap. The snap is consumed (and disappears)
 * as soon as its photo has loaded, so it can only be seen once.
 */
export function SnapViewerScreen() {
  const { snapId } = useLocalSearchParams<{ snapId: string }>();
  const { snapService } = useServices();
  const mediaController = useMediaController();
  const consumed = useRef(false);

  // Never cache or refetch: once consumed, the snap is gone.
  const snap = useQuery({
    queryKey: ['snap', snapId],
    queryFn: () => snapService.getSnap(snapId),
    gcTime: 0,
    staleTime: Infinity,
  });

  const consume = () => {
    if (consumed.current) return;
    consumed.current = true;
    mediaController.consumeSnap(snapId).catch((error: unknown) => {
      // The snap stays in the list and can be opened again.
      console.error('[snaps] Could not mark snap as opened', error);
    });
  };

  const close = (
    <IconButton
      icon="close"
      iconColor="#FFFFFF"
      onPress={() => router.back()}
      accessibilityLabel="Close snap"
      style={styles.close}
    />
  );

  if (snap.isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (snap.error || !snap.data) {
    if (snap.error) console.error('[snaps] Could not load snap', snap.error);
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.text}>
          {snap.error
            ? "Couldn't load this snap. Try again later."
            : 'This snap is no longer available.'}
        </Text>
        {close}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={{ uri: snap.data.imageUrl }}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
        cachePolicy="memory"
        onLoad={consume}
        onError={(event) => console.error('[snaps] Could not display snap', event.error)}
        accessibilityLabel={`Snap from ${snap.data.snap.senderName}`}
      />
      <View style={styles.header}>
        <Text style={styles.text}>{snap.data.snap.senderName}</Text>
        {close}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  centered: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 12,
  },
  text: { color: '#FFFFFF', fontWeight: '600' },
  close: { margin: 0 },
});
