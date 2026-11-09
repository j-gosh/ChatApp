import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import type { ReactNode, Ref } from 'react';
import { StyleSheet } from 'react-native';

function Backdrop(props: BottomSheetBackdropProps) {
  return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />;
}

/**
 * Modal bottom sheet with a drag handle that closes on backdrop tap —
 * `.
 */
export function AppBottomSheet({
  ref,
  heightPercent,
  children,
}: {
  ref: Ref<BottomSheetModal>;
  /** Sheet height as a percentage of the screen. */
  heightPercent: number;
  children: ReactNode;
}) {
  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={[`${heightPercent}%`]}
      enableDynamicSizing={false}
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
