import 'package:chat_app/core/controllers/chat_controller.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import '../helpers/mock_services.dart';
import '../helpers/provider_test_helper.dart';

// Fallback values for mocktail — needed for any()/captureAny() on these types
class FakeRoom extends Fake implements Room {}

class FakeUser extends Fake implements User {}

class FakePartialText extends Fake implements PartialText {}

void main() {
  late MockChatService mockChat;
  late MockUserService mockUser;

  setUpAll(() {
    registerFallbackValue(FakeRoom());
    registerFallbackValue(FakeUser());
    registerFallbackValue(FakePartialText());
  });

  setUp(() {
    mockChat = MockChatService();
    mockUser = MockUserService();
  });

  ChatController makeController() {
    final container = makeContainer(
      chatService: mockChat,
      userService: mockUser,
    );
    addTearDown(container.dispose);
    return container.read(chatControllerProvider);
  }

  group('ChatController.sendMessage', () {
    test('delegates to chatService.sendMessage', () async {
      const message = PartialText(text: 'Hello');
      when(() => mockChat.sendMessage(any(), any())).thenAnswer((_) async {});

      await makeController().sendMessage(message, 'room-1');

      verify(() => mockChat.sendMessage(message, 'room-1')).called(1);
    });
  });

  group('ChatController.createRoom', () {
    test('delegates to chatService.createRoom and returns Room', () async {
      const otherUser = User(id: 'uid-2');
      const expectedRoom = Room(id: 'r-1', type: RoomType.direct, users: []);
      when(
        () => mockChat.createRoom(any()),
      ).thenAnswer((_) async => expectedRoom);

      final room = await makeController().createRoom(otherUser);

      expect(room, expectedRoom);
      verify(() => mockChat.createRoom(otherUser)).called(1);
    });
  });

  group('ChatController.updateRoom', () {
    test('delegates to chatService.updateRoom', () async {
      const room = Room(id: 'r-1', type: RoomType.direct, users: []);
      when(() => mockChat.updateRoom(any())).thenAnswer((_) async {});

      await makeController().updateRoom(room);

      verify(() => mockChat.updateRoom(room)).called(1);
    });
  });

  group('ChatController.addFriend', () {
    test('delegates to userService.addUserToFriendsList', () async {
      const friend = User(id: 'uid-2');
      when(
        () => mockUser.addUserToFriendsList(any(), any()),
      ).thenAnswer((_) async {});

      await makeController().addFriend('uid-1', friend);

      verify(() => mockUser.addUserToFriendsList('uid-1', friend)).called(1);
    });
  });
}
