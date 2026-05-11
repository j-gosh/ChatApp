import 'package:chat_app/routes.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:mocktail/mocktail.dart';

class MockFirebaseUser extends Mock implements User {}

void main() {
  group('computeRedirect', () {
    final mockUser = MockFirebaseUser();

    // Unauthenticated state
    const noUser = AsyncData<User?>(null);

    // Authenticated state — wrap mock user in AsyncData
    late AsyncData<User?> withUser;

    setUp(() {
      withUser = AsyncData<User?>(mockUser);
    });

    test('unauthenticated at "/" redirects to "/splash"', () {
      expect(computeRedirect(noUser, '/'), '/splash');
    });

    test('unauthenticated at "/splash" redirects to "/onboarding"', () {
      expect(computeRedirect(noUser, '/splash'), '/onboarding');
    });

    test('unauthenticated at "/onboarding" returns null (no redirect)', () {
      expect(computeRedirect(noUser, '/onboarding'), isNull);
    });

    test('authenticated at "/splash" redirects to "/"', () {
      expect(computeRedirect(withUser, '/splash'), '/');
    });

    test('authenticated at "/onboarding" redirects to "/"', () {
      expect(computeRedirect(withUser, '/onboarding'), '/');
    });

    test('authenticated at "/" returns null (no redirect)', () {
      expect(computeRedirect(withUser, '/'), isNull);
    });

    test('authenticated at "/chat" returns null (no redirect)', () {
      expect(computeRedirect(withUser, '/chat'), isNull);
    });

    test('loading state returns null regardless of location', () {
      const loading = AsyncLoading<User?>();
      expect(computeRedirect(loading, '/'), isNull);
      expect(computeRedirect(loading, '/splash'), isNull);
    });

    test('error state returns null regardless of location', () {
      final error = AsyncError<User?>(Exception('auth error'), StackTrace.empty);
      expect(computeRedirect(error, '/'), isNull);
      expect(computeRedirect(error, '/splash'), isNull);
    });
  });
}
