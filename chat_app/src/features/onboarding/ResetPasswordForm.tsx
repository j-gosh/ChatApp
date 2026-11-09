import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { FormTextInput } from '@/components/FormTextInput';
import { useAuthController } from '@/controllers/use-auth-controller';
import { SheetButton } from '@/features/onboarding/SheetButton';
import { validateResetEmail } from '@/features/onboarding/validation';
import { showSnackbar } from '@/stores/snackbar-store';
import { getAuthErrorMessage } from '@/utils/errors';

/** Password-reset form shown in a bottom sheet. Sends a Firebase reset email. */
export function ResetPasswordForm({ onClose }: { onClose: () => void }) {
  const authController = useAuthController();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();

  const sendReset = useMutation({
    mutationFn: (address: string) => authController.sendPasswordReset(address),
    onSuccess: () => {
      showSnackbar('Password reset email sent.');
      onClose();
    },
  });

  const submit = () => {
    const error = validateResetEmail(email);
    setEmailError(error);
    if (!error) sendReset.mutate(email.trim());
  };

  return (
    <View>
      <Text style={styles.description}>
        Enter the email address linked with your account to have a recovery email sent.
      </Text>
      <Text style={styles.error}>
        {sendReset.error ? getAuthErrorMessage(sendReset.error) : ''}
      </Text>
      <FormTextInput
        testID="reset-email"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        errorText={emailError}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        returnKeyType="send"
        onSubmitEditing={submit}
      />
      <SheetButton
        testID="reset-submit"
        variant="confirm"
        onPress={submit}
        loading={sendReset.isPending}
        disabled={sendReset.isPending}
      >
        Send Reset Email
      </SheetButton>
      <SheetButton variant="cancel" onPress={onClose}>
        Cancel
      </SheetButton>
    </View>
  );
}

const styles = StyleSheet.create({
  description: { padding: 25, paddingBottom: 0, marginTop: 30 },
  error: { fontSize: 14, color: 'red', textAlign: 'center', margin: 5 },
});
