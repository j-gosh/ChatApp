import { MaterialIcons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import { StyleSheet, View, type ColorValue } from 'react-native';
import { IconButton } from 'react-native-paper';

import { ProfileAvatar } from '@/components/ProfileAvatar';
import { appBarTheme, tabBarTheme } from '@/theme/app-theme';

function tabIcon(name: keyof typeof MaterialIcons.glyphMap) {
  return function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    // The tab bar passes the string tint colors configured below.
    return <MaterialIcons name={name} color={color as string} size={size} />;
  };
}

function ChatHeaderActions() {
  return (
    <View style={styles.headerActions}>
      <IconButton
        icon="camera"
        iconColor={appBarTheme.tintColor}
        onPress={() => router.push('/camera')}
        accessibilityLabel="Open camera"
      />
      <ProfileAvatar />
    </View>
  );
}

/** Bottom tab navigator: Chat, Map, Video, Discover. Each tab keeps its state while hidden. */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: appBarTheme.backgroundColor },
        headerTintColor: appBarTheme.tintColor,
        tabBarShowLabel: false,
        tabBarStyle: { backgroundColor: tabBarTheme.backgroundColor },
        tabBarActiveTintColor: tabBarTheme.activeTintColor,
        tabBarInactiveTintColor: tabBarTheme.inactiveTintColor,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarAccessibilityLabel: 'Chat',
          tabBarIcon: tabIcon('chat'),
          headerRight: ChatHeaderActions,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          headerShown: false,
          tabBarAccessibilityLabel: 'Map',
          tabBarIcon: tabIcon('map'),
        }}
      />
      <Tabs.Screen
        name="video"
        options={{
          title: '',
          tabBarAccessibilityLabel: 'Video',
          tabBarIcon: tabIcon('video-call'),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarAccessibilityLabel: 'Discover',
          tabBarIcon: tabIcon('search'),
          headerRight: ProfileAvatar,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: 'row', alignItems: 'center' },
});
