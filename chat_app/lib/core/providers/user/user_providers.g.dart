// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// Loads the [UserProfile] for the currently signed-in user from Firestore.
/// Throws if the user is not authenticated.

@ProviderFor(userProfile)
final userProfileProvider = UserProfileProvider._();

/// Loads the [UserProfile] for the currently signed-in user from Firestore.
/// Throws if the user is not authenticated.

final class UserProfileProvider
    extends
        $FunctionalProvider<
          AsyncValue<UserProfile>,
          UserProfile,
          FutureOr<UserProfile>
        >
    with $FutureModifier<UserProfile>, $FutureProvider<UserProfile> {
  /// Loads the [UserProfile] for the currently signed-in user from Firestore.
  /// Throws if the user is not authenticated.
  UserProfileProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'userProfileProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$userProfileHash();

  @$internal
  @override
  $FutureProviderElement<UserProfile> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<UserProfile> create(Ref ref) {
    return userProfile(ref);
  }
}

String _$userProfileHash() => r'c685634b669690d8096c533c16d5f84dbc11e9f1';

/// Fetches the raw Firestore document containing Stream Video credentials for
/// the user identified by [userId].

@ProviderFor(userVideoCredentials)
final userVideoCredentialsProvider = UserVideoCredentialsFamily._();

/// Fetches the raw Firestore document containing Stream Video credentials for
/// the user identified by [userId].

final class UserVideoCredentialsProvider
    extends
        $FunctionalProvider<
          AsyncValue<DocumentSnapshot<Map<String, dynamic>>>,
          DocumentSnapshot<Map<String, dynamic>>,
          FutureOr<DocumentSnapshot<Map<String, dynamic>>>
        >
    with
        $FutureModifier<DocumentSnapshot<Map<String, dynamic>>>,
        $FutureProvider<DocumentSnapshot<Map<String, dynamic>>> {
  /// Fetches the raw Firestore document containing Stream Video credentials for
  /// the user identified by [userId].
  UserVideoCredentialsProvider._({
    required UserVideoCredentialsFamily super.from,
    required String super.argument,
  }) : super(
         retry: null,
         name: r'userVideoCredentialsProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$userVideoCredentialsHash();

  @override
  String toString() {
    return r'userVideoCredentialsProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  $FutureProviderElement<DocumentSnapshot<Map<String, dynamic>>> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<DocumentSnapshot<Map<String, dynamic>>> create(Ref ref) {
    final argument = this.argument as String;
    return userVideoCredentials(ref, argument);
  }

  @override
  bool operator ==(Object other) {
    return other is UserVideoCredentialsProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$userVideoCredentialsHash() =>
    r'e56d72562ec769d21cb9b0338f6b3c2e00ec2d59';

/// Fetches the raw Firestore document containing Stream Video credentials for
/// the user identified by [userId].

final class UserVideoCredentialsFamily extends $Family
    with
        $FunctionalFamilyOverride<
          FutureOr<DocumentSnapshot<Map<String, dynamic>>>,
          String
        > {
  UserVideoCredentialsFamily._()
    : super(
        retry: null,
        name: r'userVideoCredentialsProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  /// Fetches the raw Firestore document containing Stream Video credentials for
  /// the user identified by [userId].

  UserVideoCredentialsProvider call(String userId) =>
      UserVideoCredentialsProvider._(argument: userId, from: this);

  @override
  String toString() => r'userVideoCredentialsProvider';
}

/// Real-time stream of all friends documents in the `userFriendsList/{userId}/friends`
/// Firestore subcollection.

@ProviderFor(userFriendsStream)
final userFriendsStreamProvider = UserFriendsStreamFamily._();

/// Real-time stream of all friends documents in the `userFriendsList/{userId}/friends`
/// Firestore subcollection.

final class UserFriendsStreamProvider
    extends
        $FunctionalProvider<
          AsyncValue<QuerySnapshot<Map<String, dynamic>>>,
          QuerySnapshot<Map<String, dynamic>>,
          Stream<QuerySnapshot<Map<String, dynamic>>>
        >
    with
        $FutureModifier<QuerySnapshot<Map<String, dynamic>>>,
        $StreamProvider<QuerySnapshot<Map<String, dynamic>>> {
  /// Real-time stream of all friends documents in the `userFriendsList/{userId}/friends`
  /// Firestore subcollection.
  UserFriendsStreamProvider._({
    required UserFriendsStreamFamily super.from,
    required String super.argument,
  }) : super(
         retry: null,
         name: r'userFriendsStreamProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$userFriendsStreamHash();

  @override
  String toString() {
    return r'userFriendsStreamProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  $StreamProviderElement<QuerySnapshot<Map<String, dynamic>>> $createElement(
    $ProviderPointer pointer,
  ) => $StreamProviderElement(pointer);

  @override
  Stream<QuerySnapshot<Map<String, dynamic>>> create(Ref ref) {
    final argument = this.argument as String;
    return userFriendsStream(ref, argument);
  }

  @override
  bool operator ==(Object other) {
    return other is UserFriendsStreamProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$userFriendsStreamHash() => r'6b6306b2cc55b52de38ab8bf3e4c2061ffa332e7';

/// Real-time stream of all friends documents in the `userFriendsList/{userId}/friends`
/// Firestore subcollection.

final class UserFriendsStreamFamily extends $Family
    with
        $FunctionalFamilyOverride<
          Stream<QuerySnapshot<Map<String, dynamic>>>,
          String
        > {
  UserFriendsStreamFamily._()
    : super(
        retry: null,
        name: r'userFriendsStreamProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  /// Real-time stream of all friends documents in the `userFriendsList/{userId}/friends`
  /// Firestore subcollection.

  UserFriendsStreamProvider call(String userId) =>
      UserFriendsStreamProvider._(argument: userId, from: this);

  @override
  String toString() => r'userFriendsStreamProvider';
}

/// One-time fetch of all documents in the public `users` Firestore collection.

@ProviderFor(publicUsers)
final publicUsersProvider = PublicUsersProvider._();

/// One-time fetch of all documents in the public `users` Firestore collection.

final class PublicUsersProvider
    extends
        $FunctionalProvider<
          AsyncValue<QuerySnapshot<Map<String, dynamic>>>,
          QuerySnapshot<Map<String, dynamic>>,
          FutureOr<QuerySnapshot<Map<String, dynamic>>>
        >
    with
        $FutureModifier<QuerySnapshot<Map<String, dynamic>>>,
        $FutureProvider<QuerySnapshot<Map<String, dynamic>>> {
  /// One-time fetch of all documents in the public `users` Firestore collection.
  PublicUsersProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'publicUsersProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$publicUsersHash();

  @$internal
  @override
  $FutureProviderElement<QuerySnapshot<Map<String, dynamic>>> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<QuerySnapshot<Map<String, dynamic>>> create(Ref ref) {
    return publicUsers(ref);
  }
}

String _$publicUsersHash() => r'f8fc8126a6da1faf3e866e893383f9532fd31fd5';
