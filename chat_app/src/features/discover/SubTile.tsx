import { Image } from 'expo-image';
import { FlatList, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { ErrorState } from '@/components/ErrorState';
import { SectionTitle } from '@/features/discover/SectionTitle';
import { useSubscriptions } from '@/hooks/content/use-subscriptions';

/** Horizontal subscriptions carousel. */
export function SubTile() {
  const { width, height } = useWindowDimensions();
  const subscriptions = useSubscriptions();

  return (
    <View style={styles.container}>
      <SectionTitle>Subscriptions</SectionTitle>
      {subscriptions.isLoading ? (
        <Text style={styles.message}>Loading subscriptions…</Text>
      ) : subscriptions.error ? (
        <ErrorState
          message="Couldn't load subscriptions."
          onRetry={() => subscriptions.refetch()}
        />
      ) : (
        <FlatList
          horizontal
          data={subscriptions.data ?? []}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.message}>No subscriptions yet.</Text>}
          renderItem={({ item }) => (
            <View style={[styles.card, { width: width * 0.22, height: height * 0.2 }]}>
              <Image
                source={{ uri: item.imageUrl }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                accessibilityLabel={item.label}
              />
              <View style={styles.labelContainer}>
                <Text style={styles.label}>{item.label}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 4 },
  list: { gap: 8, paddingHorizontal: 4 },
  card: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    justifyContent: 'flex-end',
  },
  labelContainer: {
    padding: 4,
    backgroundImage: 'linear-gradient(to top, #000000, transparent)',
  },
  label: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  message: { padding: 12, textAlign: 'center' },
});
