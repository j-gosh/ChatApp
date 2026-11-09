import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useStoryStore } from '@/stores/story-store';

const ITEM_DURATION_MS = 5000;

function ProgressSegment({ state }: { state: 'done' | 'active' | 'pending' }) {
  const progress = useSharedValue(state === 'done' ? 1 : 0);

  useEffect(() => {
    if (state === 'active') {
      progress.value = 0;
      progress.value = withTiming(1, { duration: ITEM_DURATION_MS, easing: Easing.linear });
    } else {
      progress.value = state === 'done' ? 1 : 0;
    }
  }, [progress, state]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <View style={styles.segment}>
      <Animated.View style={[styles.segmentFill, fillStyle]} />
    </View>
  );
}

/**
 * Full-screen story viewer. Auto-advances every few seconds; tap the left or
 * right half of the screen to go back or forward.
 */
export function StoryViewerScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const selectedStory = useStoryStore((state) => state.selectedStory);
  // The story is chosen in the Discover feed; a stale or deep-linked route has none.
  const story = selectedStory?.userId === userId ? selectedStory : null;
  const [index, setIndex] = useState(0);
  const itemCount = story?.items.length ?? 0;

  const next = () => (index + 1 < itemCount ? setIndex(index + 1) : router.back());
  const previous = () => setIndex(Math.max(0, index - 1));

  useEffect(() => {
    if (!itemCount) return;
    const timer = setTimeout(() => {
      if (index + 1 < itemCount) setIndex(index + 1);
      else router.back();
    }, ITEM_DURATION_MS);
    return () => clearTimeout(timer);
  }, [index, itemCount]);

  const item = story?.items[index];

  return (
    <SafeAreaView style={styles.container}>
      {story && item ? (
        <>
          <Image
            source={{ uri: item.imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            accessibilityLabel={item.caption || `${story.displayName}'s story`}
          />
          <View style={styles.tapZones}>
            <Pressable style={styles.tapZone} onPress={previous} accessibilityLabel="Previous" />
            <Pressable style={styles.tapZone} onPress={next} accessibilityLabel="Next" />
          </View>
          <View style={styles.header}>
            <View style={styles.progress}>
              {story.items.map((storyItem, itemIndex) => (
                <ProgressSegment
                  key={storyItem.id}
                  state={itemIndex < index ? 'done' : itemIndex === index ? 'active' : 'pending'}
                />
              ))}
            </View>
            <View style={styles.titleRow}>
              <Pressable
                onPress={() =>
                  router.replace({ pathname: '/user/[userId]', params: { userId: story.userId } })
                }
                accessibilityRole="button"
                accessibilityLabel={`Open ${story.displayName}'s profile`}
              >
                <Text style={styles.name}>{story.displayName}</Text>
              </Pressable>
              <IconButton
                icon="close"
                iconColor="#FFFFFF"
                onPress={() => router.back()}
                accessibilityLabel="Close story"
              />
            </View>
          </View>
          {item.caption ? <Text style={styles.caption}>{item.caption}</Text> : null}
        </>
      ) : (
        <View style={styles.missing}>
          <Text style={styles.name}>This story is no longer available.</Text>
          <IconButton
            icon="close"
            iconColor="#FFFFFF"
            onPress={() => router.back()}
            accessibilityLabel="Close story"
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  tapZones: { ...StyleSheet.absoluteFill, flexDirection: 'row' },
  tapZone: { flex: 1 },
  header: { paddingHorizontal: 8, paddingTop: 8 },
  progress: { flexDirection: 'row', gap: 4 },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
    overflow: 'hidden',
  },
  segmentFill: { height: '100%', backgroundColor: '#FFFFFF' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { color: '#FFFFFF', fontWeight: '600', paddingLeft: 4 },
  caption: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    color: '#FFFFFF',
    fontSize: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    overflow: 'hidden',
  },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
