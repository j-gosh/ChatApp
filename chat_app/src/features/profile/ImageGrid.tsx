import { Image } from 'expo-image';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export interface GridImage {
  id: string;
  uri: string;
  description: string;
}

/** Three-column photo grid used by the profile's Stories and Memories tabs. */
export function ImageGrid({
  items,
  emptyText,
  onPressItem,
}: {
  items: GridImage[];
  emptyText: string;
  onPressItem?: (item: GridImage) => void;
}) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      numColumns={3}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => (
        <Pressable
          style={styles.cell}
          onPress={onPressItem && (() => onPressItem(item))}
          disabled={!onPressItem}
          accessibilityRole={onPressItem ? 'button' : 'image'}
          accessibilityLabel={item.description}
        >
          <Image source={{ uri: item.uri }} style={styles.image} contentFit="cover" />
        </Pressable>
      )}
      ListEmptyComponent={<Text style={styles.empty}>{emptyText}</Text>}
    />
  );
}

const styles = StyleSheet.create({
  content: { gap: 4, paddingBottom: 16 },
  row: { gap: 4 },
  cell: {
    flex: 1 / 3,
    aspectRatio: 9.9 / 15.7,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 6,
    overflow: 'hidden',
  },
  image: { flex: 1 },
  empty: { padding: 18, textAlign: 'center' },
});
