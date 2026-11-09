import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { ErrorState } from '@/components/ErrorState';
import { UserAvatar } from '@/components/UserAvatar';
import { SectionTitle } from '@/features/discover/SectionTitle';
import { useStoryFeed } from '@/hooks/stories/use-story-feed';
import type { Story } from '@/models/story';
import { useSignedInUser } from '@/providers/AuthStateProvider';
import { useStoryStore } from '@/stores/story-store';
import { palette } from '@/theme/app-theme';

/** Stories from friends and people you follow, as a row of avatars. Tapping one opens the viewer. */
export function StoryTile() {
  const { uid } = useSignedInUser();
  const { data: stories, error, isLoading } = useStoryFeed();
  const selectStory = useStoryStore((state) => state.selectStory);

  const openStory = (story: Story) => {
    selectStory(story);
    router.push({ pathname: '/story/[userId]', params: { userId: story.userId } });
  };

  return (
    <View style={styles.container}>
      <SectionTitle>Stories</SectionTitle>
      {isLoading ? (
        <Text style={styles.message}>Loading stories…</Text>
      ) : error ? (
        <ErrorState message="Couldn't load stories." />
      ) : (
        <FlatList
          horizontal
          data={stories ?? []}
          keyExtractor={(story) => story.userId}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.message}>
              No stories yet. Follow people or add friends to see theirs.
            </Text>
          }
          renderItem={({ item: story }) => {
            const label = story.userId === uid ? 'Your story' : story.displayName;
            return (
              <Pressable
                style={styles.story}
                accessibilityRole="button"
                accessibilityLabel={`Open ${story.userId === uid ? 'your' : `${story.displayName}'s`} story`}
                onPress={() => openStory(story)}
              >
                <View style={styles.ring}>
                  <UserAvatar size={64} name={story.displayName} imageUrl={story.imageUrl} />
                </View>
                <Text numberOfLines={1} style={styles.name}>
                  {label}
                </Text>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 4 },
  list: { gap: 12, paddingHorizontal: 8 },
  story: { alignItems: 'center', width: 76 },
  ring: { borderWidth: 3, borderColor: palette.amber, borderRadius: 40, padding: 2 },
  name: { marginTop: 4, fontSize: 12 },
  message: { padding: 12, textAlign: 'center' },
});
