import 'package:chat_app/core/providers/auth/auth_providers.dart';
import 'package:chat_app/core/providers/chat/chat_providers.dart';
import 'package:chat_app/core/controllers/chat_controller.dart';
import 'package:chat_app/utils/loading_animation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_chat_ui/flutter_chat_ui.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart' as types;
import 'package:hooks_riverpod/hooks_riverpod.dart';

/// Full-screen chat UI for a single conversation room.
///
/// Requires [selectedRoomProvider] to be set before navigating here.
/// Renders the `flutter_chat_ui` [Chat] widget which handles message rendering
/// and the send bar. Messages stream live via [chatMessagesProvider].
class MessagesView extends ConsumerStatefulWidget {
  const MessagesView({super.key});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() {
    return _MessagesViewState();
  }
}

class _MessagesViewState extends ConsumerState<MessagesView> {
  @override
  Widget build(BuildContext context) {
    final currentUser = ref.watch(currentUserProvider);
    final room = ref.watch(selectedRoomProvider);

    if (currentUser == null || room == null) {
      return const Scaffold(
        body: Center(child: Text('No user or room selected')),
      );
    }

    final chatUser = types.User(id: currentUser.uid);
    final groupThreadMessages = ref.watch(chatMessagesProvider(room));
    return groupThreadMessages.when(
      data: (data) {
        if (data.isNotEmpty) {
          return Scaffold(
            appBar: AppBar(title: const Text('')),
            body: Chat(
              user: chatUser,
              showUserNames: true,
              messages: data,
              onSendPressed: (text) {
                final chatController = ref.read(chatControllerProvider);
                chatController.sendMessage(text, room.id);
              },
              emojiEnlargementBehavior: EmojiEnlargementBehavior.single,
            ),
          );
        } else {
          return Scaffold(
            appBar: AppBar(title: const Text('New Message')),
            body: Chat(
              user: chatUser,
              showUserNames: true,
              messages: const [],
              onSendPressed: (text) {
                final chatController = ref.read(chatControllerProvider);
                chatController.sendMessage(text, room.id);
              },
              emojiEnlargementBehavior: EmojiEnlargementBehavior.single,
            ),
          );
        }
      },
      error: (error, stackTrace) {
        return Center(child: Text('$error, $stackTrace'));
      },
      loading: () {
        return const LoadingAnimation();
      },
    );
  }
}
