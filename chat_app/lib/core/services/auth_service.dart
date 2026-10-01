import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_firebase_chat_core/flutter_firebase_chat_core.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart' as chat_types;

/// Contract for authentication operations.
///
/// The concrete implementation is [FirebaseAuthService]. Coding against this
/// abstract class makes the auth layer swappable and independently testable.
abstract class AuthService {
  /// The currently signed-in Firebase user, or null.
  User? get currentUser;

  /// UID of the currently signed-in user, or null.
  String? get currentUserId;

  /// Stream that emits the signed-in user whenever auth state changes.
  Stream<User?> get authStateChanges;

  /// Signs in with email/password and returns the credential.
  Future<UserCredential> signInWithEmailAndPassword(
    String email,
    String password,
  );

  /// Creates a new Firebase Auth account and returns the credential.
  Future<UserCredential> createUserWithEmailAndPassword(
    String email,
    String password,
  );

  /// Signs the current user out.
  Future<void> signOut();

  /// Creates the companion chat user document in FirebaseChatCore (Firestore).
  Future<void> createChatUser(String firstName, String lastName);
}

/// Firebase-backed implementation of [AuthService].
class FirebaseAuthService implements AuthService {
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;

  @override
  User? get currentUser => _firebaseAuth.currentUser;

  @override
  String? get currentUserId => _firebaseAuth.currentUser?.uid;

  @override
  Stream<User?> get authStateChanges => _firebaseAuth.authStateChanges();

  @override
  Future<UserCredential> signInWithEmailAndPassword(
    String email,
    String password,
  ) {
    return _firebaseAuth.signInWithEmailAndPassword(
      email: email,
      password: password,
    );
  }

  @override
  Future<UserCredential> createUserWithEmailAndPassword(
    String email,
    String password,
  ) {
    return _firebaseAuth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
  }

  @override
  Future<void> signOut() {
    return _firebaseAuth.signOut();
  }

  @override
  Future<void> createChatUser(String firstName, String lastName) async {
    final id = currentUserId;
    if (id == null) throw Exception('User not authenticated');

    await FirebaseChatCore.instance.createUserInFirestore(
      chat_types.User(id: id, firstName: firstName, lastName: lastName),
    );
  }
}
