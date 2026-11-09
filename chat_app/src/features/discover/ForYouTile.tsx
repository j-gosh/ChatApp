import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { ErrorState } from '@/components/ErrorState';
import { ALL_CATEGORIES, FiltersTile } from '@/features/discover/FiltersTile';
import { SectionTitle } from '@/features/discover/SectionTitle';
import { useNews } from '@/hooks/content/use-news';

/** Horizontal row of news cards, filterable by category. */
export function ForYouTile() {
  const { width, height } = useWindowDimensions();
  const news = useNews();
  const articles = useMemo(() => news.data ?? [], [news.data]);
  // Unique categories, in first-seen order.
  const categories = useMemo(
    () => [...new Set(articles.map((article) => article.category))],
    [articles],
  );
  const [category, setCategory] = useState(ALL_CATEGORIES);

  const visibleArticles =
    category === ALL_CATEGORIES
      ? articles
      : articles.filter((article) => article.category === category);

  return (
    <View style={styles.container}>
      <SectionTitle>For you</SectionTitle>
      {news.isLoading ? (
        <Text style={styles.message}>Loading news…</Text>
      ) : news.error ? (
        <ErrorState message="Couldn't load the news." onRetry={() => news.refetch()} />
      ) : (
        <>
          <FiltersTile categories={categories} selected={category} onSelect={setCategory} />
          <FlatList
            horizontal
            data={visibleArticles}
            keyExtractor={(article) => article.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.message}>No news yet.</Text>}
            renderItem={({ item: article }) => (
              <View style={[styles.card, { width: width * 0.6, height: height * 0.22 }]}>
                <Image
                  source={{ uri: article.thumbnailUrl }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  accessibilityLabel={article.title}
                />
                <View style={styles.titleContainer}>
                  <Text style={styles.title} numberOfLines={2}>
                    {article.title}
                  </Text>
                </View>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 4 },
  list: { gap: 4, paddingHorizontal: 4 },
  card: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    justifyContent: 'flex-end',
  },
  titleContainer: {
    padding: 6,
    backgroundImage: 'linear-gradient(to top, #000000, transparent)',
  },
  title: { color: '#FFFFFF', fontWeight: '600' },
  message: { padding: 12, textAlign: 'center' },
});
