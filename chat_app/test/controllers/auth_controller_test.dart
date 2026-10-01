import 'package:chat_app/core/controllers/auth_controller.dart';
import 'package:chat_app/models/user/user_video_creds.dart';
import 'package:firebase_auth/firebase_auth.dart' as fa;
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:stream_video/stream_video.dart' as sv;

import '../helpers/mock_services.dart';
import '../helpers/provider_test_helper.dart';

class MockUserCredential extends Mock implements fa.UserCredential {}

class MockFirebaseUser extends Mock implements fa.User {}

void main() {
  late MockAuthService mockAuth;
  late MockUserService mockUserService;
  late MockVideoService mockVideo;
  late MockUserCredential mockCredential;
  late MockFirebaseUser mockFirebaseUser;

  setUp(() {
    mockAuth = MockAuthService();
    mockUserService = MockUserService();
    mockVideo = MockVideoService();
    mockCredential = MockUserCredential();
    mockFirebaseUser = MockFirebaseUser();

    registerFallbackValue(
      UserVideoCredentials(
        userInfo: const sv.UserInfo(id: 'fallback'),
        userToken: sv.UserToken.jwt('fallback-token'),
      ),
    );

    when(() => mockCredential.user).thenReturn(mockFirebaseUser);
    when(() => mockFirebaseUser.uid).thenReturn('uid-123');
  });

  AuthController makeController() {
    final container = makeContainer(
      authService: mockAuth,
      userService: mockUserService,
      videoService: mockVideo,
    );
    addTearDown(container.dispose);
    return container.read(authControllerProvider);
  }

  group('AuthController.signIn', () {
    test('calls signInWithEmailAndPassword with correct credentials', () async {
      when(
        () => mockAuth.signInWithEmailAndPassword(any(), any()),
      ).thenAnswer((_) async => mockCredential);

      await makeController().signIn('user@test.com', 'pass123');

      verify(
        () => mockAuth.signInWithEmailAndPassword('user@test.com', 'pass123'),
      ).called(1);
    });

    test('propagates exception from service', () async {
      when(
        () => mockAuth.signInWithEmailAndPassword(any(), any()),
      ).thenThrow(fa.FirebaseAuthException(code: 'wrong-password'));

      await expectLater(
        makeController().signIn('user@test.com', 'wrong'),
        throwsA(isA<fa.FirebaseAuthException>()),
      );
    });
  });

  group('AuthController.signUp', () {
    setUp(() {
      when(
        () => mockAuth.createUserWithEmailAndPassword(any(), any()),
      ).thenAnswer((_) async => mockCredential);
      when(() => mockVideo.generateVideoCredentials(any())).thenReturn(
        UserVideoCredentials(
          userInfo: const sv.UserInfo(id: 'uid-123'),
          userToken: sv.UserToken.jwt('token-abc'),
        ),
      );
      when(
        () => mockVideo.saveUserVideoCredentials(any(), any()),
      ).thenAnswer((_) async {});
      when(
        () => mockAuth.createChatUser(any(), any()),
      ).thenAnswer((_) async {});
      when(
        () => mockUserService.saveUserProfile(any(), any(), any(), any()),
      ).thenAnswer((_) async {});
    });

    test('calls createUserWithEmailAndPassword', () async {
      await makeController().signUp(
        email: 'a@b.com',
        password: 'pass',
        firstName: 'First',
        lastName: 'Last',
      );
      verify(
        () => mockAuth.createUserWithEmailAndPassword('a@b.com', 'pass'),
      ).called(1);
    });

    test('calls generateVideoCredentials with returned uid', () async {
      await makeController().signUp(
        email: 'a@b.com',
        password: 'pass',
        firstName: 'First',
        lastName: 'Last',
      );
      verify(() => mockVideo.generateVideoCredentials('uid-123')).called(1);
    });

    test('calls saveUserVideoCredentials and createChatUser', () async {
      await makeController().signUp(
        email: 'a@b.com',
        password: 'pass',
        firstName: 'First',
        lastName: 'Last',
      );
      verify(() => mockVideo.saveUserVideoCredentials(any(), any())).called(1);
      verify(() => mockAuth.createChatUser('First', 'Last')).called(1);
    });

    test('calls saveUserProfile when userName is provided', () async {
      await makeController().signUp(
        email: 'a@b.com',
        password: 'pass',
        firstName: 'First',
        lastName: 'Last',
        userName: 'firstlast',
      );
      verify(
        () => mockUserService.saveUserProfile(any(), 'firstlast', any(), any()),
      ).called(1);
    });

    test('does NOT call saveUserProfile when userName is null', () async {
      await makeController().signUp(
        email: 'a@b.com',
        password: 'pass',
        firstName: 'First',
        lastName: 'Last',
      );
      verifyNever(
        () => mockUserService.saveUserProfile(any(), any(), any(), any()),
      );
    });
  });

  group('AuthController.signOut', () {
    test('calls authService.signOut()', () async {
      when(() => mockAuth.signOut()).thenAnswer((_) async {});

      await makeController().signOut();

      verify(() => mockAuth.signOut()).called(1);
    });
  });
}
