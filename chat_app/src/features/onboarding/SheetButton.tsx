import type { ComponentProps } from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

const variants = {
  confirm: 'rgb(210, 217, 131)',
  cancel: 'rgb(223, 217, 218)',
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
      buttonColor={variants[variant]}
      textColor="#000000"
      style={styles.button}
    />
  );
}

const styles = StyleSheet.create({
  button: { width: 250, alignSelf: 'center', marginVertical: 5 },
});
