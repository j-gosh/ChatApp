import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';

export const ALL_CATEGORIES = 'All';

/** Horizontal category chips that filter the "For you" articles. */
export function FiltersTile({
  categories,
  selected,
  onSelect,
}: {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
    >
      {[ALL_CATEGORIES, ...categories].map((category) => (
        <Chip
          key={category}
          selected={selected === category}
          showSelectedOverlay
          onPress={() => onSelect(category)}
        >
          {category}
        </Chip>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8, paddingHorizontal: 8, paddingBottom: 8 },
});
