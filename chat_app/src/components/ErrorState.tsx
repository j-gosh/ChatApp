import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

/** Inline error message with an optional retry action. */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Button mode="outlined" onPress={onRetry}>
          Try again
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, alignItems: 'center', gap: 12 },
  message: { textAlign: 'center' },
});
