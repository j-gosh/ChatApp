import 'package:chat_app/core/providers/ui/ui_providers.dart';
import 'package:chat_app/view/chats/friends/active_users.dart';
import 'package:chat_app/view/chats/friends/friends_list.dart';
import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

/// Container that switches between [FriendsList] and [ActiveUsers] based on
/// [friendsPageIndexProvider].
class FriendsView extends ConsumerStatefulWidget {
  const FriendsView({super.key});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() {
    return _FriendsViewState();
  }
}

class _FriendsViewState extends ConsumerState<FriendsView> {
  @override
  Widget build(BuildContext context) {
    final friendsPageIndex = ref.watch(friendsPageIndexProvider);

    return SizedBox(
      height: MediaQuery.of(context).size.height * 0.85,
      width: MediaQuery.of(context).size.width - 20,
      child: friendsPageIndex == 0 ? const FriendsList() : const ActiveUsers(),
    );
  }
}
