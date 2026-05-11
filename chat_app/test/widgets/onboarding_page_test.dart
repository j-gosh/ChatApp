import 'package:chat_app/view/onboarding/onboarding.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget buildTestable() => const MaterialApp(home: OnboardingPage());

  group('OnboardingPage', () {
    testWidgets('renders Sign in button', (tester) async {
      await tester.pumpWidget(buildTestable());
      expect(find.text('Sign in'), findsOneWidget);
    });

    testWidgets('renders Register button', (tester) async {
      await tester.pumpWidget(buildTestable());
      expect(find.text('Register'), findsOneWidget);
    });

    testWidgets('renders Forgot Password button', (tester) async {
      await tester.pumpWidget(buildTestable());
      expect(find.text('Forgot Password'), findsOneWidget);
    });

    testWidgets('all three buttons are ElevatedButtons', (tester) async {
      await tester.pumpWidget(buildTestable());
      expect(find.byType(ElevatedButton), findsNWidgets(3));
    });

    testWidgets('tapping Sign in opens a bottom sheet', (tester) async {
      await tester.pumpWidget(buildTestable());
      await tester.tap(find.text('Sign in'));
      await tester.pumpAndSettle();
      // ModalBottomSheet adds a DraggableScrollableSheet or barrier overlay
      expect(find.byType(BottomSheet), findsOneWidget);
    });
  });
}
