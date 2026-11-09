import { Linking, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

/**
 * Explains why a permission is needed. Offers to ask again when the OS allows
 * it, otherwise sends the user to the app's settings.
 */
export function PermissionGate({
  message,
  canRequest,
  onRequest,
}: {
  message: string;
  canRequest: boolean;
  onRequest: () => void;
}) {
  const openSettings = () => {
    Linking.openSettings().catch((error: unknown) => {
      console.error('[permissions] Could not open settings', error);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {canRequest ? (
        <Button mode="contained" onPress={onRequest}>
          Allow access
        </Button>
      ) : (
        <Button mode="contained" onPress={openSettings}>
          Open Settings
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  message: { textAlign: 'center' },
});
