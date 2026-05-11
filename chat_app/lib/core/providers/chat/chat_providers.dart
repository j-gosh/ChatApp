import 'package:chat_app/core/providers/service/service_providers.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'chat_providers.g.dart';

/// Live stream of all chat rooms the current user belongs to, ordered by most
/// recently updated.
@riverpod
Stream<List<Room>> chatRooms(Ref ref) =>
    ref.watch(chatServiceProvider).getRooms(orderByUpdatedAt: true);

/// Live stream of messages inside [room], newest first.
@riverpod
Stream<List<Message>> chatMessages(Ref ref, Room room) =>
    ref.watch(chatServiceProvider).getMessages(room);

/// Live stream of all registered users visible to the chat SDK
/// (used to populate the "new conversation" user picker).
@riverpod
Stream<List<User>> availableUsers(Ref ref) =>
    ref.watch(chatServiceProvider).getUsers();

/// Holds the room that the user is currently viewing in the messages screen.
///
/// Set to a [Room] before navigating to `/messages`; cleared when leaving.
@riverpod
class SelectedRoom extends _$SelectedRoom {
  @override
  Room? build() => null;

  /// Marks [room] as the active conversation.
  void select(Room room) => state = room;

  /// Clears the active conversation selection.
  void clear() => state = null;
}
