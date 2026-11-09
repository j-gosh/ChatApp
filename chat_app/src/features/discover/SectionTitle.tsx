import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.title}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
});
