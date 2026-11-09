import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Avatar } from 'react-native-paper';

import { palette } from '@/theme/app-theme';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);
}

/** A user's profile photo, or their initials when they haven't set one. */
export function UserAvatar({
  name,
  imageUrl,
  size,
  style,
}: {
  name: string;
  imageUrl?: string | null;
  size: number;
  style?: StyleProp<ViewStyle>;
}) {
  if (imageUrl) {
    return <Avatar.Image size={size} source={{ uri: imageUrl }} style={style} />;
  }
  const label = initials(name);
  return label ? (
    <Avatar.Text size={size} label={label} style={[styles.fallback, style]} />
  ) : (
    <Avatar.Icon size={size} icon="account" style={[styles.fallback, style]} />
  );
}

const styles = StyleSheet.create({
  fallback: { backgroundColor: palette.amber },
});
