import { StyleSheet, View } from 'react-native';

import { FriendsList } from '@/features/chats/FriendsList';
import { colors } from '@/theme/app-theme';

export default function FriendsScreen() {
  return (
    <View style={styles.container}>
      <FriendsList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: colors.surface },
});
