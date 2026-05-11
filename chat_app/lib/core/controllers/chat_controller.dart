import 'package:chat_app/core/providers/service/service_providers.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'chat_controller.g.dart';

/// Handles chat and friend-management business logic.
///
/// Consumed by UI widgets via [chatControllerProvider]. All Firestore / chat
/// SDK calls are delegated to the underlying services.
class ChatController {
  final Ref ref;

  ChatController(this.ref);

  /// Sends a text [message] to the chat room identified by [roomId].
  Future<void> sendMessage(PartialText message, String roomId) async {
    final chatService = ref.read(chatServiceProvider);
    await chatService.sendMessage(message, roomId);
  }

  /// Creates (or fetches existing) a direct-message room with [otherUser].
  Future<Room> createRoom(User otherUser) async {
    final chatService = ref.read(chatServiceProvider);
    return await chatService.createRoom(otherUser);
  }

  /// Updates metadata on an existing [room].
  Future<void> updateRoom(Room room) async {
    final chatService = ref.read(chatServiceProvider);
    await chatService.updateRoom(room);
  }

  /// Adds [user] to the friends list of the account identified by [userId].
  Future<void> addFriend(String userId, User user) async {
    final userService = ref.read(userServiceProvider);
    await userService.addUserToFriendsList(userId, user);
  }
}

@Riverpod(keepAlive: true)
ChatController chatController(Ref ref) => ChatController(ref);
