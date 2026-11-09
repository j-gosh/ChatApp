import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/AppBottomSheet';
import { LoginForm } from '@/features/onboarding/LoginForm';
import { RegisterForm } from '@/features/onboarding/RegisterForm';
import { ResetPasswordForm } from '@/features/onboarding/ResetPasswordForm';

type Sheet = 'login' | 'register' | 'resetPassword';

const sheetHeights: Record<Sheet, number> = {
  login: 70,
  register: 80,
  resetPassword: 70,
};

/**
 * Landing screen for signed-out users. Opens the sign-in, register, and
 * forgot-password forms in bottom sheets.
 */
export function OnboardingScreen() {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [sheet, setSheet] = useState<Sheet>('login');

  const open = (next: Sheet) => {
    setSheet(next);
    sheetRef.current?.present();
  };
  const close = () => sheetRef.current?.dismiss();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.buttons}>
        <Button
          mode="elevated"
          style={styles.button}
          testID="open-login"
          onPress={() => open('login')}
        >
          Sign in
        </Button>
        <Button
          mode="elevated"
          style={styles.button}
          testID="open-register"
          onPress={() => open('register')}
        >
          Register
        </Button>
        <Button
          mode="elevated"
          style={styles.button}
          testID="open-reset-password"
          onPress={() => open('resetPassword')}
        >
          Forgot Password
        </Button>
      </View>
      <AppBottomSheet ref={sheetRef} heightPercent={sheetHeights[sheet]}>
        {sheet === 'login' && <LoginForm onClose={close} />}
        {sheet === 'register' && <RegisterForm onClose={close} />}
        {sheet === 'resetPassword' && <ResetPasswordForm onClose={close} />}
      </AppBottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  buttons: { paddingTop: 70 },
  button: { margin: 5 },
});
