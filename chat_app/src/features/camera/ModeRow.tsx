import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { colors } from '@/theme/app-theme';

const ACTIVE_COLOR = colors.primary;
const INACTIVE_COLOR = colors.textMuted;

export interface ModeOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

/** A titled row of mutually exclusive options; the active one is highlighted. */
export function ModeRow<T extends string>({
  title,
  options,
  value,
  onChange,
  children,
}: {
  title: string;
  options: ModeOption<T>[];
  value: T;
  onChange: (value: T) => void;
  children?: ReactNode;
}) {
  return (
    <Animated.View entering={FadeInDown} exiting={FadeOutUp} style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.options}>
        {options.map((option) => (
          <Button
            key={option.value}
            compact
            disabled={option.disabled}
            textColor={option.value === value ? ACTIVE_COLOR : INACTIVE_COLOR}
            onPress={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </View>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, paddingVertical: 4 },
  title: { textAlign: 'center' },
  options: { flexDirection: 'row', justifyContent: 'space-evenly', flexWrap: 'wrap' },
});
