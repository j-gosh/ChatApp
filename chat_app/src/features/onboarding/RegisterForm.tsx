import { useMutation } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { FormTextInput, type FormTextInputHandle } from '@/components/FormTextInput';
import { ProfileSetupError, useAuthController } from '@/controllers/use-auth-controller';
import { SheetButton } from '@/features/onboarding/SheetButton';
import {
  hasErrors,
  validateRegister,
  type FieldErrors,
  type RegisterValues,
} from '@/features/onboarding/validation';
import { showSnackbar } from '@/stores/snackbar-store';
import { getAuthErrorMessage } from '@/utils/errors';

/**
 * New-account form shown in a bottom sheet. On success creates the Firebase Auth
 * user, profile, and chat user; auth-aware routing then opens the app.
 */
export function RegisterForm({ onClose }: { onClose: () => void }) {
  const authController = useAuthController();
  const lastNameRef = useRef<FormTextInputHandle>(null);
  const emailRef = useRef<FormTextInputHandle>(null);
  const passwordRef = useRef<FormTextInputHandle>(null);
  const [values, setValues] = useState<RegisterValues>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<keyof RegisterValues>>({});

  const signUp = useMutation({
    mutationFn: ({ firstName, lastName, email, password }: RegisterValues) =>
      authController.signUp({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        userName: `${firstName.trim()}_${lastName.trim()}`,
      }),
    onSuccess: onClose,
    onError: (error) => {
      // The account exists and the app is already opening, so this sheet is going away.
      if (error instanceof ProfileSetupError) {
        showSnackbar(error.message);
        onClose();
      }
    },
  });

  const update = (field: keyof RegisterValues) => (text: string) =>
    setValues((current) => ({ ...current, [field]: text }));

  const submit = () => {
    const errors = validateRegister(values);
    setFieldErrors(errors);
    if (!hasErrors(errors)) signUp.mutate(values);
  };

  const authError =
    signUp.error && !(signUp.error instanceof ProfileSetupError)
      ? getAuthErrorMessage(signUp.error)
      : '';

  return (
    <View>
      <Text style={styles.title}>Register</Text>
      <Text style={styles.error}>{authError}</Text>
      <FormTextInput
        testID="register-first-name"
        placeholder="First Name"
        value={values.firstName}
        onChangeText={update('firstName')}
        errorText={fieldErrors.firstName}
        autoComplete="given-name"
        autoFocus
        returnKeyType="next"
        onSubmitEditing={() => lastNameRef.current?.focus()}
      />
      <FormTextInput
        ref={lastNameRef}
        testID="register-last-name"
        placeholder="Last Name"
        value={values.lastName}
        onChangeText={update('lastName')}
        errorText={fieldErrors.lastName}
        autoComplete="family-name"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
      />
      <FormTextInput
        ref={emailRef}
        testID="register-email"
        placeholder="Email"
        value={values.email}
        onChangeText={update('email')}
        errorText={fieldErrors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <FormTextInput
        ref={passwordRef}
        testID="register-password"
        placeholder="Password"
        value={values.password}
        onChangeText={update('password')}
        errorText={fieldErrors.password}
        secureTextEntry
        autoComplete="new-password"
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <SheetButton
        testID="register-submit"
        variant="confirm"
        onPress={submit}
        loading={signUp.isPending}
        disabled={signUp.isPending}
      >
        Sign Up
      </SheetButton>
      <SheetButton variant="cancel" onPress={onClose}>
        Cancel
      </SheetButton>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 36, textAlign: 'center', padding: 2, lineHeight: 44 },
  error: { fontSize: 14, color: 'red', textAlign: 'center', margin: 8 },
});
