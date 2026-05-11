// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'ui_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// Tracks which tab is active in the bottom navigation bar.
///
/// 0 = Chat, 1 = Map, 2 = Video, 3 = Discover.

@ProviderFor(NavigationIndex)
final navigationIndexProvider = NavigationIndexProvider._();

/// Tracks which tab is active in the bottom navigation bar.
///
/// 0 = Chat, 1 = Map, 2 = Video, 3 = Discover.
final class NavigationIndexProvider
    extends $NotifierProvider<NavigationIndex, int> {
  /// Tracks which tab is active in the bottom navigation bar.
  ///
  /// 0 = Chat, 1 = Map, 2 = Video, 3 = Discover.
  NavigationIndexProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'navigationIndexProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$navigationIndexHash();

  @$internal
  @override
  NavigationIndex create() => NavigationIndex();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(int value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<int>(value),
    );
  }
}

String _$navigationIndexHash() => r'3315499f4010f0e9bc7235dc9849a4bb2660c12d';

/// Tracks which tab is active in the bottom navigation bar.
///
/// 0 = Chat, 1 = Map, 2 = Video, 3 = Discover.

abstract class _$NavigationIndex extends $Notifier<int> {
  int build();
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<int, int>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<int, int>,
              int,
              Object?,
              Object?
            >;
    element.handleCreate(ref, build);
  }
}

/// Tracks which sub-page is shown inside the chat page.
///
/// 0 = message threads list, 1 = friends/new conversation view.

@ProviderFor(ChatPageIndex)
final chatPageIndexProvider = ChatPageIndexProvider._();

/// Tracks which sub-page is shown inside the chat page.
///
/// 0 = message threads list, 1 = friends/new conversation view.
final class ChatPageIndexProvider
    extends $NotifierProvider<ChatPageIndex, int> {
  /// Tracks which sub-page is shown inside the chat page.
  ///
  /// 0 = message threads list, 1 = friends/new conversation view.
  ChatPageIndexProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'chatPageIndexProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$chatPageIndexHash();

  @$internal
  @override
  ChatPageIndex create() => ChatPageIndex();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(int value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<int>(value),
    );
  }
}

String _$chatPageIndexHash() => r'9fd854ae185a87dc1f7236dfdf6fed354a96a460';

/// Tracks which sub-page is shown inside the chat page.
///
/// 0 = message threads list, 1 = friends/new conversation view.

abstract class _$ChatPageIndex extends $Notifier<int> {
  int build();
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<int, int>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<int, int>,
              int,
              Object?,
              Object?
            >;
    element.handleCreate(ref, build);
  }
}

/// Tracks which sub-page is shown inside the friends panel.
///
/// 0 = friends list, 1 = active (all) users.

@ProviderFor(FriendsPageIndex)
final friendsPageIndexProvider = FriendsPageIndexProvider._();

/// Tracks which sub-page is shown inside the friends panel.
///
/// 0 = friends list, 1 = active (all) users.
final class FriendsPageIndexProvider
    extends $NotifierProvider<FriendsPageIndex, int> {
  /// Tracks which sub-page is shown inside the friends panel.
  ///
  /// 0 = friends list, 1 = active (all) users.
  FriendsPageIndexProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'friendsPageIndexProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$friendsPageIndexHash();

  @$internal
  @override
  FriendsPageIndex create() => FriendsPageIndex();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(int value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<int>(value),
    );
  }
}

String _$friendsPageIndexHash() => r'c3d9de23a0816aad00a5e17fd1a57af00704e6f0';

/// Tracks which sub-page is shown inside the friends panel.
///
/// 0 = friends list, 1 = active (all) users.

abstract class _$FriendsPageIndex extends $Notifier<int> {
  int build();
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<int, int>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<int, int>,
              int,
              Object?,
              Object?
            >;
    element.handleCreate(ref, build);
  }
}
