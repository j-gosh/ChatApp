import 'package:chat_app/core/providers/user/user_providers.dart';
import 'package:chat_app/models/group/group_model.dart';
import 'package:chat_app/models/user/user_model.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import '../helpers/mock_services.dart';
import '../helpers/provider_test_helper.dart';

void main() {
  late MockAuthService mockAuth;
  late MockUserService mockUser;

  setUp(() {
    mockAuth = MockAuthService();
    mockUser = MockUserService();
  });

  group('userProfileProvider', () {
    test('throws Exception when currentUserId is null', () async {
      when(() => mockAuth.currentUserId).thenReturn(null);

      final container = makeContainer(
        authService: mockAuth,
        userService: mockUser,
      );
      addTearDown(container.dispose);

      await expectLater(
        container.read(userProfileProvider.future),
        throwsA(
          isA<Exception>().having(
            (e) => e.toString(),
            'message',
            contains('not authenticated'),
          ),
        ),
      );
    });

    test('returns UserProfile when userId is present and service resolves',
        () async {
      const profile = UserProfile(
        userName: 'jdoe',
        first: 'John',
        last: 'Doe',
        groups: <GroupModel>[],
      );
      when(() => mockAuth.currentUserId).thenReturn('uid-1');
      when(() => mockUser.getUserProfile('uid-1'))
          .thenAnswer((_) async => profile);

      final container = makeContainer(
        authService: mockAuth,
        userService: mockUser,
      );
      addTearDown(container.dispose);

      final result = await container.read(userProfileProvider.future);
      expect(result, profile);
    });

    test('propagates service exception as AsyncError', () async {
      when(() => mockAuth.currentUserId).thenReturn('uid-1');
      when(() => mockUser.getUserProfile('uid-1'))
          .thenThrow(Exception('Firestore error'));

      final container = makeContainer(
        authService: mockAuth,
        userService: mockUser,
      );
      addTearDown(container.dispose);

      await expectLater(
        container.read(userProfileProvider.future),
        throwsA(isA<Exception>()),
      );
    });
  });

  group('publicUsersProvider', () {
    test('calls userService.getPublicUsers()', () async {
      when(() => mockUser.getPublicUsers())
          .thenAnswer((_) async => throw UnimplementedError('stub'));

      final container = makeContainer(userService: mockUser);
      addTearDown(container.dispose);

      // Verify the provider delegates to the service
      await expectLater(
        container.read(publicUsersProvider.future),
        throwsA(isA<UnimplementedError>()),
      );
      verify(() => mockUser.getPublicUsers()).called(1);
    });
  });
}
