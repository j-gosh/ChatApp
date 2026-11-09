import { StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

/** Centered loading spinner for full-screen loading states. */
export function LoadingAnimation() {
  return (
    <View style={styles.container} accessibilityRole="progressbar">
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 150 },
});
