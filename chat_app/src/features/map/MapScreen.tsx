import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Banner, FAB } from 'react-native-paper';

import { FriendMarker } from '@/features/map/FriendMarker';
import { useCurrentLocation } from '@/features/map/use-current-location';
import { useFriendLocations } from '@/hooks/location/use-friend-locations';
import { useSignedInUser } from '@/providers/AuthStateProvider';

const USER_REGION_DELTA = 0.05;
// How often marker "updated N min ago" labels refresh.
const CLOCK_INTERVAL_MS = 60_000;
const FIT_PADDING = { top: 80, right: 80, bottom: 80, left: 80 };

/**
 * Google map showing the user's location and the last shared locations of
 * friends who share with them. Without location access the map frames the
 * friends instead.
 */
export function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const { uid } = useSignedInUser();
  const friendLocations = useFriendLocations(uid);
  const friends = useMemo(() => friendLocations.data ?? [], [friendLocations.data]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), CLOCK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);
  const { status, canAskAgain, coordinates, request } = useCurrentLocation();

  const centerOnUser = () => {
    if (!coordinates) return;
    mapRef.current?.animateToRegion({
      ...coordinates,
      latitudeDelta: USER_REGION_DELTA,
      longitudeDelta: USER_REGION_DELTA,
    });
  };

  const frameFriends = () => {
    if (friends.length === 0) return;
    mapRef.current?.fitToCoordinates(
      friends.map(({ latitude, longitude }) => ({ latitude, longitude })),
      { edgePadding: FIT_PADDING, animated: true },
    );
  };

  // Without the user's own position, frame friends once their locations first arrive.
  const hasFramedFriends = useRef(false);
  useEffect(() => {
    if (coordinates || friends.length === 0 || hasFramedFriends.current) return;
    hasFramedFriends.current = true;
    mapRef.current?.fitToCoordinates(
      friends.map(({ latitude, longitude }) => ({ latitude, longitude })),
      { edgePadding: FIT_PADDING, animated: true },
    );
  }, [coordinates, friends]);

  useEffect(() => {
    if (coordinates) {
      mapRef.current?.animateToRegion({
        ...coordinates,
        latitudeDelta: USER_REGION_DELTA,
        longitudeDelta: USER_REGION_DELTA,
      });
    }
  }, [coordinates]);

  const showBanner = status === 'denied' || status === 'unavailable';
  const isEmpty = !friendLocations.isLoading && friends.length === 0;
  const openSharingSettings = () => router.push('/settings');
  const openSettings = () => {
    Linking.openSettings().catch((error: unknown) => {
      console.error('[map] Could not open settings', error);
    });
  };

  return (
    <View style={styles.container}>
      <Banner
        visible={showBanner}
        icon="map-marker-off"
        actions={
          status === 'denied' && !canAskAgain
            ? [{ label: 'Open Settings', onPress: openSettings }]
            : [{ label: 'Try again', onPress: request }]
        }
      >
        {status === 'denied'
          ? 'Location is off. Allow location access to see yourself on the map.'
          : "We couldn't find your location."}
      </Banner>
      <Banner
        visible={!showBanner && (friendLocations.error !== undefined || isEmpty)}
        icon={friendLocations.error ? 'alert-circle-outline' : 'account-group-outline'}
        actions={
          friendLocations.error ? [] : [{ label: 'Share mine', onPress: openSharingSettings }]
        }
      >
        {friendLocations.error
          ? "Couldn't load your friends' locations."
          : 'None of your friends are sharing their location with you yet.'}
      </Banner>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        googleRenderer="LATEST"
        showsUserLocation={status === 'granted'}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        zoomControlEnabled
        onMapReady={() => {
          if (!coordinates) frameFriends();
        }}
      >
        {friends.map((friend) => (
          <FriendMarker key={friend.id} friend={friend} now={now} />
        ))}
      </MapView>
      <FAB
        style={styles.fab}
        icon={coordinates ? 'crosshairs-gps' : 'account-group'}
        accessibilityLabel={coordinates ? 'Center on my location' : 'Show friends'}
        onPress={coordinates ? centerOnUser : frameFriends}
        visible={coordinates !== null || friends.length > 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
