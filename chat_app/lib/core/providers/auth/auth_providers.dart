import 'package:chat_app/core/providers/service/service_providers.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'auth_providers.g.dart';

/// Real-time stream of the signed-in [User]. Emits null when signed out.
/// Kept alive so the GoRouter notifier always has a subscription.
@Riverpod(keepAlive: true)
Stream<User?> authState(Ref ref) =>
    ref.watch(authServiceProvider).authStateChanges;

/// Synchronous snapshot of the currently signed-in [User], or null.
@Riverpod(keepAlive: true)
User? currentUser(Ref ref) => ref.watch(authServiceProvider).currentUser;

/// UID of the signed-in user, or null when unauthenticated.
@Riverpod(keepAlive: true)
String? currentUserId(Ref ref) => ref.watch(authServiceProvider).currentUserId;
