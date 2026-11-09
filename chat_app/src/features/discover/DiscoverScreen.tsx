import { ScrollView, StyleSheet } from 'react-native';
import { Divider } from 'react-native-paper';

import { ForYouTile } from '@/features/discover/ForYouTile';
import { StoryTile } from '@/features/discover/StoryTile';
import { SubTile } from '@/features/discover/SubTile';

/** Discover feed: subscriptions, personalized news, and friends' stories. */
export function DiscoverScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SubTile />
      <Divider style={styles.divider} />
      <ForYouTile />
      <Divider style={styles.divider} />
      <StoryTile />
      <Divider style={styles.divider} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingBottom: 70 },
  divider: { backgroundColor: '#000000' },
});
