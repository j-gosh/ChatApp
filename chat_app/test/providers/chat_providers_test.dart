import 'package:chat_app/core/providers/chat/chat_providers.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import '../helpers/mock_services.dart';
import '../helpers/provider_test_helper.dart';

void main() {
  late MockChatService mockChat;

  setUp(() {
    mockChat = MockChatService();
  });

  group('chatRoomsProvider', () {
    test('emits room list from chatService.getRooms()', () async {
      const testRoom = Room(id: 'r-1', type: RoomType.direct, users: []);
      when(
        () =>
            mockChat.getRooms(orderByUpdatedAt: any(named: 'orderByUpdatedAt')),
      ).thenAnswer((_) => Stream.value([testRoom]));

      final container = makeContainer(chatService: mockChat);
      addTearDown(container.dispose);

      final rooms = await container.read(chatRoomsProvider.future);
      expect(rooms, [testRoom]);
    });

    test('emits error when service throws', () async {
      when(
        () =>
            mockChat.getRooms(orderByUpdatedAt: any(named: 'orderByUpdatedAt')),
      ).thenAnswer((_) => Stream.error(Exception('network error')));

      final container = makeContainer(chatService: mockChat);
      addTearDown(container.dispose);

      await expectLater(
        container.read(chatRoomsProvider.future),
        throwsA(isA<Exception>()),
      );
    });
  });

  group('chatMessagesProvider', () {
    test('emits message list for a given Room', () async {
      const testRoom = Room(id: 'r-1', type: RoomType.direct, users: []);
      const testMessage = TextMessage(
        id: 'm-1',
        author: User(id: 'uid-1'),
        text: 'Hello',
      );
      when(
        () => mockChat.getMessages(testRoom),
      ).thenAnswer((_) => Stream.value([testMessage]));

      final container = makeContainer(chatService: mockChat);
      addTearDown(container.dispose);

      final messages = await container.read(
        chatMessagesProvider(testRoom).future,
      );
      expect(messages, [testMessage]);
    });
  });

  group('availableUsersProvider', () {
    test('emits user list from chatService.getUsers()', () async {
      const testUser = User(id: 'uid-1');
      when(
        () => mockChat.getUsers(),
      ).thenAnswer((_) => Stream.value([testUser]));

      final container = makeContainer(chatService: mockChat);
      addTearDown(container.dispose);

      final users = await container.read(availableUsersProvider.future);
      expect(users, [testUser]);
    });
  });

  group('SelectedRoom notifier', () {
    test('initial state is null', () {
      final container = makeContainer();
      addTearDown(container.dispose);
      expect(container.read(selectedRoomProvider), isNull);
    });

    test('select() sets the room', () {
      const room = Room(id: 'r-1', type: RoomType.direct, users: []);
      final container = makeContainer();
      addTearDown(container.dispose);

      container.read(selectedRoomProvider.notifier).select(room);
      expect(container.read(selectedRoomProvider), room);
    });

    test('clear() resets to null', () {
      const room = Room(id: 'r-1', type: RoomType.direct, users: []);
      final container = makeContainer();
      addTearDown(container.dispose);

      container.read(selectedRoomProvider.notifier).select(room);
      container.read(selectedRoomProvider.notifier).clear();
      expect(container.read(selectedRoomProvider), isNull);
    });
  });
}
