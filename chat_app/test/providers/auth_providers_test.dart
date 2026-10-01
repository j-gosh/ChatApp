import 'package:chat_app/core/providers/auth/auth_providers.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import '../helpers/mock_services.dart';
import '../helpers/provider_test_helper.dart';

class MockFirebaseUser extends Mock implements User {}

void main() {
  late MockAuthService mockAuth;
  late MockFirebaseUser mockUser;

  setUp(() {
    mockAuth = MockAuthService();
    mockUser = MockFirebaseUser();
    when(() => mockUser.uid).thenReturn('uid-123');
  });

  group('authStateProvider', () {
    test('emits AsyncData(user) when service stream emits a user', () async {
      when(
        () => mockAuth.authStateChanges,
      ).thenAnswer((_) => Stream.value(mockUser));

      final container = makeContainer(authService: mockAuth);
      addTearDown(container.dispose);

      final value = await container.read(authStateProvider.future);
      expect(value, mockUser);
    });

    test('emits AsyncData(null) when user is signed out', () async {
      when(
        () => mockAuth.authStateChanges,
      ).thenAnswer((_) => Stream.value(null));

      final container = makeContainer(authService: mockAuth);
      addTearDown(container.dispose);

      final value = await container.read(authStateProvider.future);
      expect(value, isNull);
    });
  });

  group('currentUserProvider', () {
    test('returns the current Firebase user', () {
      when(() => mockAuth.currentUser).thenReturn(mockUser);

      final container = makeContainer(authService: mockAuth);
      addTearDown(container.dispose);

      expect(container.read(currentUserProvider), mockUser);
    });

    test('returns null when not signed in', () {
      when(() => mockAuth.currentUser).thenReturn(null);

      final container = makeContainer(authService: mockAuth);
      addTearDown(container.dispose);

      expect(container.read(currentUserProvider), isNull);
    });
  });

  group('currentUserIdProvider', () {
    test('returns uid when user is signed in', () {
      when(() => mockAuth.currentUserId).thenReturn('uid-123');

      final container = makeContainer(authService: mockAuth);
      addTearDown(container.dispose);

      expect(container.read(currentUserIdProvider), 'uid-123');
    });

    test('returns null when not signed in', () {
      when(() => mockAuth.currentUserId).thenReturn(null);

      final container = makeContainer(authService: mockAuth);
      addTearDown(container.dispose);

      expect(container.read(currentUserIdProvider), isNull);
    });
  });
}
