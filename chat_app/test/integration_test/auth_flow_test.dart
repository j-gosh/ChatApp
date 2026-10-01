import 'package:chat_app/main.dart' as app;
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

// ---------------------------------------------------------------------------
// Integration tests — require Firebase emulators running locally.
//
// Start emulators first:
//   firebase emulators:start --only auth,firestore
//
// Then run:
//   flutter test integration_test/auth_flow_test.dart
// ---------------------------------------------------------------------------
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    await Firebase.initializeApp();
    await FirebaseAuth.instance.useAuthEmulator('localhost', 9099);
    FirebaseFirestore.instance.useFirestoreEmulator('localhost', 8080);
  });

  tearDownAll(() async {
    // Clean up any test user created during tests
    try {
      await FirebaseAuth.instance.currentUser?.delete();
    } catch (_) {}
  });

  group('Auth flow', () {
    const testEmail = 'integration_test@example.com';
    const testPassword = 'Test1234!';
    const testFirstName = 'Test';
    const testLastName = 'User';

    testWidgets('sign up creates account and lands on HomePage', (
      tester,
    ) async {
      app.main();
      await tester.pumpAndSettle();

      // Should land on OnboardingPage while signed out
      expect(find.text('Sign in'), findsOneWidget);

      // Tap Register
      await tester.tap(find.text('Register'));
      await tester.pumpAndSettle();

      // Fill in registration form
      await tester.enterText(find.byKey(const Key('firstName')), testFirstName);
      await tester.enterText(find.byKey(const Key('lastName')), testLastName);
      await tester.enterText(find.byKey(const Key('email')), testEmail);
      await tester.enterText(find.byKey(const Key('password')), testPassword);

      await tester.tap(find.text('Create Account'));
      await tester.pumpAndSettle();

      // Should be on HomePage after successful sign-up
      expect(find.byType(BottomNavigationBar), findsOneWidget);
    });

    testWidgets('sign out redirects to OnboardingPage', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Tap Settings icon on ProfilePage to sign out
      await tester.tap(find.byIcon(Icons.settings));
      await tester.pumpAndSettle();

      expect(find.text('Sign in'), findsOneWidget);
    });

    testWidgets('sign in with existing credentials lands on HomePage', (
      tester,
    ) async {
      app.main();
      await tester.pumpAndSettle();

      await tester.tap(find.text('Sign in'));
      await tester.pumpAndSettle();

      await tester.enterText(find.byKey(const Key('email')), testEmail);
      await tester.enterText(find.byKey(const Key('password')), testPassword);
      await tester.tap(find.text('Sign In'));
      await tester.pumpAndSettle();

      expect(find.byType(BottomNavigationBar), findsOneWidget);
    });
  });
}
