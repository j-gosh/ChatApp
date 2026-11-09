import { Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

/** A labelled count on a profile header, optionally tappable. */
export function ProfileStat({
  label,
  value,
  onPress,
}: {
  label: string;
  value: number | string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={styles.stat}
    >
      <Text>{label}</Text>
      <Text variant="titleMedium">{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stat: { alignItems: 'center', gap: 6, padding: 8 },
});
