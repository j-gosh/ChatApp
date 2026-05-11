// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'service_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// Provides the concrete [FirebaseAuthService] as the app's [AuthService].
/// Kept alive so auth state is never torn down while the app is running.

@ProviderFor(authService)
final authServiceProvider = AuthServiceProvider._();

/// Provides the concrete [FirebaseAuthService] as the app's [AuthService].
/// Kept alive so auth state is never torn down while the app is running.

final class AuthServiceProvider
    extends $FunctionalProvider<AuthService, AuthService, AuthService>
    with $Provider<AuthService> {
  /// Provides the concrete [FirebaseAuthService] as the app's [AuthService].
  /// Kept alive so auth state is never torn down while the app is running.
  AuthServiceProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'authServiceProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$authServiceHash();

  @$internal
  @override
  $ProviderElement<AuthService> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  AuthService create(Ref ref) {
    return authService(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(AuthService value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<AuthService>(value),
    );
  }
}

String _$authServiceHash() => r'3ad54e4ef9be082dbf8e68198f6749668b7a2d0b';

/// Provides the concrete [FirestoreUserService] as the app's [UserService].

@ProviderFor(userService)
final userServiceProvider = UserServiceProvider._();

/// Provides the concrete [FirestoreUserService] as the app's [UserService].

final class UserServiceProvider
    extends $FunctionalProvider<UserService, UserService, UserService>
    with $Provider<UserService> {
  /// Provides the concrete [FirestoreUserService] as the app's [UserService].
  UserServiceProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'userServiceProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$userServiceHash();

  @$internal
  @override
  $ProviderElement<UserService> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  UserService create(Ref ref) {
    return userService(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(UserService value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<UserService>(value),
    );
  }
}

String _$userServiceHash() => r'2a242c0952df9753b985c7a66f68fe7ec00d3deb';

/// Provides the concrete [FirebaseChatService] as the app's [ChatService].

@ProviderFor(chatService)
final chatServiceProvider = ChatServiceProvider._();

/// Provides the concrete [FirebaseChatService] as the app's [ChatService].

final class ChatServiceProvider
    extends $FunctionalProvider<ChatService, ChatService, ChatService>
    with $Provider<ChatService> {
  /// Provides the concrete [FirebaseChatService] as the app's [ChatService].
  ChatServiceProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'chatServiceProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$chatServiceHash();

  @$internal
  @override
  $ProviderElement<ChatService> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  ChatService create(Ref ref) {
    return chatService(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(ChatService value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<ChatService>(value),
    );
  }
}

String _$chatServiceHash() => r'29ae34c378156070ddf9be5df4e2412b36b18c7d';

/// Provides the concrete [StreamVideoService] as the app's [VideoService].

@ProviderFor(videoService)
final videoServiceProvider = VideoServiceProvider._();

/// Provides the concrete [StreamVideoService] as the app's [VideoService].

final class VideoServiceProvider
    extends $FunctionalProvider<VideoService, VideoService, VideoService>
    with $Provider<VideoService> {
  /// Provides the concrete [StreamVideoService] as the app's [VideoService].
  VideoServiceProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'videoServiceProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$videoServiceHash();

  @$internal
  @override
  $ProviderElement<VideoService> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  VideoService create(Ref ref) {
    return videoService(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(VideoService value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<VideoService>(value),
    );
  }
}

String _$videoServiceHash() => r'c7e2d8e2b8ce08218b02b64b7bf726864ef1325f';

@ProviderFor(userFriendsList)
final userFriendsListProvider = UserFriendsListFamily._();

final class UserFriendsListProvider
    extends
        $FunctionalProvider<
          AsyncValue<List<UserProfile>>,
          List<UserProfile>,
          Stream<List<UserProfile>>
        >
    with
        $FutureModifier<List<UserProfile>>,
        $StreamProvider<List<UserProfile>> {
  UserFriendsListProvider._({
    required UserFriendsListFamily super.from,
    required String super.argument,
  }) : super(
         retry: null,
         name: r'userFriendsListProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$userFriendsListHash();

  @override
  String toString() {
    return r'userFriendsListProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  $StreamProviderElement<List<UserProfile>> $createElement(
    $ProviderPointer pointer,
  ) => $StreamProviderElement(pointer);

  @override
  Stream<List<UserProfile>> create(Ref ref) {
    final argument = this.argument as String;
    return userFriendsList(ref, argument);
  }

  @override
  bool operator ==(Object other) {
    return other is UserFriendsListProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$userFriendsListHash() => r'24fa8cec24c216a1efc11def5a75df96c8607e9d';

final class UserFriendsListFamily extends $Family
    with $FunctionalFamilyOverride<Stream<List<UserProfile>>, String> {
  UserFriendsListFamily._()
    : super(
        retry: null,
        name: r'userFriendsListProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  UserFriendsListProvider call(String userId) =>
      UserFriendsListProvider._(argument: userId, from: this);

  @override
  String toString() => r'userFriendsListProvider';
}
