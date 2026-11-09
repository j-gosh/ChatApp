import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import type { ComponentProps, ComponentRef, Ref } from 'react';
import { StyleSheet, View, type TextInput } from 'react-native';
import { HelperText, useTheme } from 'react-native-paper';

/** Imperative handle (focus, blur, clear) for a {@link FormTextInput}. */
export type FormTextInputHandle = ComponentRef<typeof TextInput>;

type FormTextInputProps = Omit<ComponentProps<typeof BottomSheetTextInput>, 'ref'> & {
  ref?: Ref<FormTextInputHandle>;
  /** Validation message shown under the field. */
  errorText?: string;
};

/**
 * Rounded outlined text field with an inline validation message, for forms
 * rendered inside bottom sheets (so the sheet moves with the keyboard).
 */
export function FormTextInput({ ref, errorText, style, ...props }: FormTextInputProps) {
  const theme = useTheme();
  const borderColor = errorText ? theme.colors.error : theme.colors.outline;

  return (
    <View style={styles.container}>
      <BottomSheetTextInput
        {...props}
        // BottomSheetTextInput types its ref as gesture-handler's TextInput component,
        // but the ref actually receives the native TextInput instance.
        ref={ref as ComponentProps<typeof BottomSheetTextInput>['ref']}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        style={[styles.input, { borderColor, color: theme.colors.onSurface }, style]}
      />
      {errorText ? (
        <HelperText type="error" visible>
          {errorText}
        </HelperText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 7 },
  input: {
    borderWidth: 1,
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
  },
});
