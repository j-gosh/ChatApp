// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'video_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// Fetches Stream Video credentials for any user by [userId].

@ProviderFor(videoCredentials)
final videoCredentialsProvider = VideoCredentialsFamily._();

/// Fetches Stream Video credentials for any user by [userId].

final class VideoCredentialsProvider
    extends
        $FunctionalProvider<
          AsyncValue<UserVideoCredentials>,
          UserVideoCredentials,
          FutureOr<UserVideoCredentials>
        >
    with
        $FutureModifier<UserVideoCredentials>,
        $FutureProvider<UserVideoCredentials> {
  /// Fetches Stream Video credentials for any user by [userId].
  VideoCredentialsProvider._({
    required VideoCredentialsFamily super.from,
    required String super.argument,
  }) : super(
         retry: null,
         name: r'videoCredentialsProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$videoCredentialsHash();

  @override
  String toString() {
    return r'videoCredentialsProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  $FutureProviderElement<UserVideoCredentials> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<UserVideoCredentials> create(Ref ref) {
    final argument = this.argument as String;
    return videoCredentials(ref, argument);
  }

  @override
  bool operator ==(Object other) {
    return other is VideoCredentialsProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$videoCredentialsHash() => r'c9fbaeab7314c9281819e919856541f46f1e8984';

/// Fetches Stream Video credentials for any user by [userId].

final class VideoCredentialsFamily extends $Family
    with $FunctionalFamilyOverride<FutureOr<UserVideoCredentials>, String> {
  VideoCredentialsFamily._()
    : super(
        retry: null,
        name: r'videoCredentialsProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  /// Fetches Stream Video credentials for any user by [userId].

  VideoCredentialsProvider call(String userId) =>
      VideoCredentialsProvider._(argument: userId, from: this);

  @override
  String toString() => r'videoCredentialsProvider';
}

/// Fetches Stream Video credentials for the currently signed-in user.
/// Throws if the user is not authenticated.

@ProviderFor(currentUserVideoCredentials)
final currentUserVideoCredentialsProvider =
    CurrentUserVideoCredentialsProvider._();

/// Fetches Stream Video credentials for the currently signed-in user.
/// Throws if the user is not authenticated.

final class CurrentUserVideoCredentialsProvider
    extends
        $FunctionalProvider<
          AsyncValue<UserVideoCredentials>,
          UserVideoCredentials,
          FutureOr<UserVideoCredentials>
        >
    with
        $FutureModifier<UserVideoCredentials>,
        $FutureProvider<UserVideoCredentials> {
  /// Fetches Stream Video credentials for the currently signed-in user.
  /// Throws if the user is not authenticated.
  CurrentUserVideoCredentialsProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'currentUserVideoCredentialsProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$currentUserVideoCredentialsHash();

  @$internal
  @override
  $FutureProviderElement<UserVideoCredentials> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<UserVideoCredentials> create(Ref ref) {
    return currentUserVideoCredentials(ref);
  }
}

String _$currentUserVideoCredentialsHash() =>
    r'c16b2e5d7398e4116892b36d0556899838dfcc30';
