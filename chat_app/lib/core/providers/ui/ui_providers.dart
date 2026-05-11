import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'ui_providers.g.dart';

/// Tracks which tab is active in the bottom navigation bar.
///
/// 0 = Chat, 1 = Map, 2 = Video, 3 = Discover.
@riverpod
class NavigationIndex extends _$NavigationIndex {
  @override
  int build() => 0;

  /// Switches the active bottom-nav tab to [index].
  void setIndex(int index) => state = index;
}

/// Tracks which sub-page is shown inside the chat page.
///
/// 0 = message threads list, 1 = friends/new conversation view.
@riverpod
class ChatPageIndex extends _$ChatPageIndex {
  @override
  int build() => 0;

  /// Switches the active chat sub-page to [index].
  void setIndex(int index) => state = index;
}

/// Tracks which sub-page is shown inside the friends panel.
///
/// 0 = friends list, 1 = active (all) users.
@riverpod
class FriendsPageIndex extends _$FriendsPageIndex {
  @override
  int build() => 0;

  /// Switches the active friends sub-page to [index].
  void setIndex(int index) => state = index;
}
