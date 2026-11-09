import { router } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { ErrorState } from '@/components/ErrorState';
import { ListCardTile } from '@/components/ListCardTile';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { useReceivedSnaps } from '@/hooks/snaps/use-received-snaps';

/** Unopened snaps sent to the user. Opening one shows it once, then it disappears. */
export function ReceivedSnapsList({ userId }: { userId: string }) {
  const { data: snaps, error, isLoading } = useReceivedSnaps(userId);

  if (isLoading) return <LoadingAnimation />;
  if (error) return <ErrorState message="Couldn't load your snaps." />;

  return (
    <FlatList
      data={snaps ?? []}
      keyExtractor={(snap) => snap.id}
      renderItem={({ item: snap }) => (
        <ListCardTile
          title={`Snap from ${snap.senderName || 'a friend'}`}
          onPress={() => router.push({ pathname: '/snap/[snapId]', params: { snapId: snap.id } })}
        />
      )}
      ListEmptyComponent={<Text style={styles.empty}>No new snaps.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  empty: { padding: 18, textAlign: 'center' },
});
