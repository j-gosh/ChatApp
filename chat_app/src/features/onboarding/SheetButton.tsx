import type { ComponentProps } from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

import { colors } from '@/theme/app-theme';

const variants = {
  confirm: { button: colors.primary, text: colors.onPrimary },
  cancel: { button: colors.surfaceVariant, text: colors.text },
} as const;

/** Fixed-width action button used at the bottom of the onboarding sheets. */
export function SheetButton({
  variant,
  ...props
}: Omit<ComponentProps<typeof Button>, 'mode' | 'buttonColor' | 'textColor'> & {
  variant: keyof typeof variants;
}) {
  return (
    <Button
      {...props}
      mode="contained"
      buttonColor={variants[variant].button}
      textColor={variants[variant].text}
      style={styles.button}
    />
  );
}

const styles = StyleSheet.create({
  button: { width: 250, alignSelf: 'center', marginVertical: 5 },
});
