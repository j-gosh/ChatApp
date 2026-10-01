import 'package:chat_app/core/providers/service/service_providers.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'auth_controller.g.dart';

/// Handles all authentication-related business logic.
///
/// Consumed by UI widgets via [authControllerProvider]. Delegates the actual
/// Firebase calls to the auth, user, and video services so the UI layer stays
/// free of SDK-specific code.
class AuthController {
  final Ref ref;

  AuthController(this.ref);

  /// Signs the user in with [email] and [password] via Firebase Auth.
  Future<void> signIn(String email, String password) async {
    final authService = ref.read(authServiceProvider);
    await authService.signInWithEmailAndPassword(email, password);
  }

  /// Creates a new account and sets up all required user data in parallel:
  /// - Firebase Auth user
  /// - Chat user record (via FirebaseChatCore)
  /// - Firestore profile document
  /// - Stream Video credentials
  Future<void> signUp({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    String? userName,
  }) async {
    final authService = ref.read(authServiceProvider);
    final userService = ref.read(userServiceProvider);
    final videoService = ref.read(videoServiceProvider);

    final userCredential = await authService.createUserWithEmailAndPassword(
      email,
      password,
    );
    final userId = userCredential.user!.uid;

    final videoCredentials = videoService.generateVideoCredentials(userId);

    await Future.wait([
      videoService.saveUserVideoCredentials(userId, videoCredentials),
      authService.createChatUser(firstName, lastName),
      if (userName != null)
        userService.saveUserProfile(userId, userName, firstName, lastName),
    ]);
  }

  /// Signs the current user out of Firebase Auth.
  Future<void> signOut() async {
    final authService = ref.read(authServiceProvider);
    await authService.signOut();
  }
}

@Riverpod(keepAlive: true)
AuthController authController(Ref ref) => AuthController(ref);
