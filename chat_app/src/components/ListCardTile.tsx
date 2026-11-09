import { StyleSheet } from 'react-native';
import { Card, List } from 'react-native-paper';

/** Tappable card-wrapped list row with a single line of text. */
export function ListCardTile({
  title,
  onPress,
  disabled,
  testID,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}) {
  return (
    <Card style={styles.card} mode="elevated">
      <List.Item title={title} onPress={onPress} disabled={disabled} testID={testID} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginVertical: 4, marginHorizontal: 2 },
});
