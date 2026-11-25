import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import type { ReactNode, Ref } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function Backdrop(props: BottomSheetBackdropProps) {
  return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />;
}

/**
 * Modal bottom sheet with a drag handle that closes on backdrop tap. It sizes
 * itself to its content so it can sit on top of the keyboard; a fixed tall
 * height plus the keyboard overflows the screen and pushes the inputs out of view.
 */
export function AppBottomSheet({
  ref,
  children,
}: {
  ref: Ref<BottomSheetModal>;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <BottomSheetModal
      ref={ref}
      // Keeps the sheet below the status bar when content + keyboard don't fit.
      topInset={insets.top}
      backdropComponent={Backdrop}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingBottom: 32 },
});
