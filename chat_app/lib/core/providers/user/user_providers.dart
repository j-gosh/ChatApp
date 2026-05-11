import 'package:chat_app/core/providers/auth/auth_providers.dart';
import 'package:chat_app/core/providers/service/service_providers.dart';
import 'package:chat_app/models/user/user_model.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'user_providers.g.dart';

/// Loads the [UserProfile] for the currently signed-in user from Firestore.
/// Throws if the user is not authenticated.
@riverpod
Future<UserProfile> userProfile(Ref ref) async {
  final userId = ref.watch(currentUserIdProvider);
  if (userId == null) throw Exception('User not authenticated');
  return ref.watch(userServiceProvider).getUserProfile(userId);
}

/// Fetches the raw Firestore document containing Stream Video credentials for
/// the user identified by [userId].
@riverpod
Future<DocumentSnapshot<Map<String, dynamic>>> userVideoCredentials(
    Ref ref, String userId) =>
    ref.watch(userServiceProvider).getUserVideoCredentials(userId);

/// Real-time stream of all friends documents in the `userFriendsList/{userId}/friends`
/// Firestore subcollection.
@riverpod
Stream<QuerySnapshot<Map<String, dynamic>>> userFriendsStream(
    Ref ref, String userId) =>
    ref.watch(userServiceProvider).getUserFriendsStream(userId);

/// One-time fetch of all documents in the public `users` Firestore collection.
@riverpod
Future<QuerySnapshot<Map<String, dynamic>>> publicUsers(Ref ref) =>
    ref.watch(userServiceProvider).getPublicUsers();
