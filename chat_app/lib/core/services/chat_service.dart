import 'package:flutter_chat_types/flutter_chat_types.dart';
import 'package:flutter_firebase_chat_core/flutter_firebase_chat_core.dart';

/// Contract for real-time chat operations.
///
/// All streams stay live via FirebaseChatCore's Firestore listeners.
/// The concrete implementation is [FirebaseChatService].
abstract class ChatService {
  /// Stream of all rooms the current user belongs to.
  Stream<List<Room>> getRooms({bool orderByUpdatedAt = true});

  /// Stream of messages inside [room], ordered newest-first.
  Stream<List<Message>> getMessages(Room room);

  /// Stream of all registered chat users (used for the "new chat" picker).
  Stream<List<User>> getUsers();

  /// Sends [message] to the room identified by [roomId].
  Future<void> sendMessage(PartialText message, String roomId);

  /// Creates (or returns existing) direct-message room with [otherUser].
  Future<Room> createRoom(User otherUser);

  /// Updates metadata on [room].
  Future<void> updateRoom(Room room);
}

/// FirebaseChatCore-backed implementation of [ChatService].
class FirebaseChatService implements ChatService {
  @override
  Stream<List<Room>> getRooms({bool orderByUpdatedAt = true}) {
    return FirebaseChatCore.instance.rooms(orderByUpdatedAt: orderByUpdatedAt);
  }

  @override
  Stream<List<Message>> getMessages(Room room) {
    return FirebaseChatCore.instance.messages(room);
  }

  @override
  Stream<List<User>> getUsers() {
    return FirebaseChatCore.instance.users();
  }

  @override
  Future<void> sendMessage(PartialText message, String roomId) async {
    FirebaseChatCore.instance.sendMessage(message, roomId);
  }

  @override
  Future<Room> createRoom(User otherUser) {
    return FirebaseChatCore.instance.createRoom(otherUser);
  }

  @override
  Future<void> updateRoom(Room room) async {
    FirebaseChatCore.instance.updateRoom(room);
  }
}
