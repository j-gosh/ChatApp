import 'package:chat_app/core/services/user_service.dart';
import 'package:chat_app/models/user/user_model.dart';
import 'package:chat_app/models/user/user_video_creds.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart';

/// Repository interface for user-profile and friends-list operations.
///
/// Mirrors [UserService] and exists as a boundary for future caching or
/// offline support without modifying the service or UI layers.
abstract class UserRepository {
  Future<UserProfile> getUserProfile(String userId);
  Future<void> saveUserProfile(
    String userId,
    String userName,
    String firstName,
    String lastName,
  );
  Future<void> updateUserProfile(
    String userId,
    String userName,
    String firstName,
    String lastName,
  );
  Future<void> saveUserVideoCredentials(
    String userId,
    UserVideoCredentials credentials,
  );
  Future<DocumentSnapshot<Map<String, dynamic>>> getUserVideoCredentials(
    String userId,
  );
  Stream<QuerySnapshot<Map<String, dynamic>>> getUserFriendsStream(
    String userId,
  );
  Future<void> addUserToFriendsList(String userId, User user);
  Future<QuerySnapshot<Map<String, dynamic>>> getPublicUsers();
}

/// Default implementation of [UserRepository] backed by [UserService].
class UserRepositoryImpl implements UserRepository {
  final UserService _userService;

  UserRepositoryImpl(this._userService);

  @override
  Future<UserProfile> getUserProfile(String userId) {
    return _userService.getUserProfile(userId);
  }

  @override
  Future<void> saveUserProfile(
    String userId,
    String userName,
    String firstName,
    String lastName,
  ) {
    return _userService.saveUserProfile(userId, userName, firstName, lastName);
  }

  @override
  Future<void> updateUserProfile(
    String userId,
    String userName,
    String firstName,
    String lastName,
  ) {
    return _userService.updateUserProfile(
      userId,
      userName,
      firstName,
      lastName,
    );
  }

  @override
  Future<void> saveUserVideoCredentials(
    String userId,
    UserVideoCredentials credentials,
  ) {
    return _userService.saveUserVideoCredentials(userId, credentials);
  }

  @override
  Future<DocumentSnapshot<Map<String, dynamic>>> getUserVideoCredentials(
    String userId,
  ) {
    return _userService.getUserVideoCredentials(userId);
  }

  @override
  Stream<QuerySnapshot<Map<String, dynamic>>> getUserFriendsStream(
    String userId,
  ) {
    return _userService.getUserFriendsStream(userId);
  }

  @override
  Future<void> addUserToFriendsList(String userId, User user) {
    return _userService.addUserToFriendsList(userId, user);
  }

  @override
  Future<QuerySnapshot<Map<String, dynamic>>> getPublicUsers() {
    return _userService.getPublicUsers();
  }
}
