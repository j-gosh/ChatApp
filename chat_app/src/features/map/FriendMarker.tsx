import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Callout, Marker } from 'react-native-maps';
import { Text } from 'react-native-paper';

import { UserAvatar } from '@/components/UserAvatar';
import type { MapFriend } from '@/models/map-friend';
import { palette } from '@/theme/app-theme';

/** A location updated this recently counts as "live". */
const LIVE_WINDOW_MS = 5 * 60 * 1000;

function describeUpdate(updatedAt: number | undefined, now: number): string {
  if (updatedAt === undefined) return '';
  const minutes = Math.floor((now - updatedAt) / 60_000);
  if (minutes < 1) return 'Updated just now';
  if (minutes < 60) return `Updated ${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Updated ${hours} h ago`;
  return `Updated ${Math.floor(hours / 24)} d ago`;
}

/**
 * A friend's location pin: avatar with a live badge, and a callout that opens
 * their profile. `now` (epoch millis) is the time used for "updated ago".
 */
export function FriendMarker({ friend, now }: { friend: MapFriend; now: number }) {
  const isLive = friend.updatedAt !== undefined && now - friend.updatedAt < LIVE_WINDOW_MS;
  const openProfile = () =>
    router.push({ pathname: '/user/[userId]', params: { userId: friend.id } });

  return (
    <Marker
      coordinate={{ latitude: friend.latitude, longitude: friend.longitude }}
      tracksViewChanges={false}
    >
      <View>
        <UserAvatar
          size={40}
          name={friend.displayName}
          imageUrl={friend.imageUrl}
          style={styles.avatar}
        />
        {isLive ? <View style={styles.liveBadge} /> : null}
      </View>
      <Callout onPress={openProfile}>
        <View style={styles.callout}>
          <Text variant="titleSmall">{friend.displayName || 'Friend'}</Text>
          <Text variant="bodySmall">{describeUpdate(friend.updatedAt, now)}</Text>
        </View>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  avatar: { borderWidth: 2, borderColor: palette.white, borderRadius: 20 },
  liveBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: palette.white,
  },
  callout: { maxWidth: 220, padding: 4 },
});
