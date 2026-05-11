// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'routes.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// Riverpod provider that creates and owns the app's [GoRouter].
///
/// Kept alive so the router is never recreated during the app's lifetime.
/// Registers [_RouterNotifier] as the refresh listenable so any Firebase
/// auth state change triggers route re-evaluation.
///
/// Routes defined:
/// - `/`            — [HomePage] (main shell with bottom nav)
/// - `/discover`    — [DiscoverPage]
/// - `/camera`      — [CameraDisplay]
/// - `/chat`        — [ChatPage]
/// - `/messages`    — [MessagesView] (requires `selectedRoom` to be set first)
/// - `/profile`     — [ProfilePage]
/// - `/friends`     — [FriendsList]
/// - `/selected/:name/:snaps/:following/:image` — [SelectedProfile]
/// - `/splash`      — [SplashScreen] (shown while auth state is resolving)
/// - `/onboarding`  — [OnboardingPage] (login / register / forgot-password)

@ProviderFor(router)
final routerProvider = RouterProvider._();

/// Riverpod provider that creates and owns the app's [GoRouter].
///
/// Kept alive so the router is never recreated during the app's lifetime.
/// Registers [_RouterNotifier] as the refresh listenable so any Firebase
/// auth state change triggers route re-evaluation.
///
/// Routes defined:
/// - `/`            — [HomePage] (main shell with bottom nav)
/// - `/discover`    — [DiscoverPage]
/// - `/camera`      — [CameraDisplay]
/// - `/chat`        — [ChatPage]
/// - `/messages`    — [MessagesView] (requires `selectedRoom` to be set first)
/// - `/profile`     — [ProfilePage]
/// - `/friends`     — [FriendsList]
/// - `/selected/:name/:snaps/:following/:image` — [SelectedProfile]
/// - `/splash`      — [SplashScreen] (shown while auth state is resolving)
/// - `/onboarding`  — [OnboardingPage] (login / register / forgot-password)

final class RouterProvider
    extends $FunctionalProvider<GoRouter, GoRouter, GoRouter>
    with $Provider<GoRouter> {
  /// Riverpod provider that creates and owns the app's [GoRouter].
  ///
  /// Kept alive so the router is never recreated during the app's lifetime.
  /// Registers [_RouterNotifier] as the refresh listenable so any Firebase
  /// auth state change triggers route re-evaluation.
  ///
  /// Routes defined:
  /// - `/`            — [HomePage] (main shell with bottom nav)
  /// - `/discover`    — [DiscoverPage]
  /// - `/camera`      — [CameraDisplay]
  /// - `/chat`        — [ChatPage]
  /// - `/messages`    — [MessagesView] (requires `selectedRoom` to be set first)
  /// - `/profile`     — [ProfilePage]
  /// - `/friends`     — [FriendsList]
  /// - `/selected/:name/:snaps/:following/:image` — [SelectedProfile]
  /// - `/splash`      — [SplashScreen] (shown while auth state is resolving)
  /// - `/onboarding`  — [OnboardingPage] (login / register / forgot-password)
  RouterProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'routerProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$routerHash();

  @$internal
  @override
  $ProviderElement<GoRouter> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  GoRouter create(Ref ref) {
    return router(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(GoRouter value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<GoRouter>(value),
    );
  }
}

String _$routerHash() => r'854c2709ccd1a03e812e6c0d407cc62e2c0553b9';
