import { useMutation } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { FormTextInput, type FormTextInputHandle } from '@/components/FormTextInput';
import { useAuthController } from '@/controllers/use-auth-controller';
import { SheetButton } from '@/features/onboarding/SheetButton';
import {
  hasErrors,
  validateLogin,
  type FieldErrors,
  type LoginValues,
} from '@/features/onboarding/validation';
import { getAuthErrorMessage } from '@/utils/errors';

/** Email/password sign-in form shown in a bottom sheet from the onboarding screen. */
export function LoginForm({ onClose }: { onClose: () => void }) {
  const authController = useAuthController();
  const passwordRef = useRef<FormTextInputHandle>(null);
  const [values, setValues] = useState<LoginValues>({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<keyof LoginValues>>({});

  const signIn = useMutation({
    mutationFn: ({ email, password }: LoginValues) => authController.signIn(email.trim(), password),
    onSuccess: onClose,
  });

  const submit = () => {
    const errors = validateLogin(values);
    setFieldErrors(errors);
    if (!hasErrors(errors)) signIn.mutate(values);
  };

  return (
    <View>
      <Text style={styles.error}>{signIn.error ? getAuthErrorMessage(signIn.error) : ''}</Text>
      <FormTextInput
        testID="login-email"
        placeholder="Email"
        value={values.email}
        onChangeText={(email) => setValues((current) => ({ ...current, email }))}
        errorText={fieldErrors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <FormTextInput
        ref={passwordRef}
        testID="login-password"
        placeholder="Password"
        value={values.password}
        onChangeText={(password) => setValues((current) => ({ ...current, password }))}
        errorText={fieldErrors.password}
        secureTextEntry
        autoComplete="current-password"
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <SheetButton
        testID="login-submit"
        variant="confirm"
        onPress={submit}
        loading={signIn.isPending}
        disabled={signIn.isPending}
      >
        Sign in
      </SheetButton>
      <SheetButton variant="cancel" onPress={onClose}>
        Cancel
      </SheetButton>
    </View>
  );
}

const styles = StyleSheet.create({
  error: { fontSize: 14, color: 'red', textAlign: 'center', margin: 5 },
});
