import 'package:chat_app/core/providers/chat/chat_providers.dart';
import 'package:chat_app/view/chats/messages/message_threads_list.dart';
import 'package:flutter/material.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

Widget buildTestable({required AsyncValue<List<Room>> rooms}) {
  return ProviderScope(
    overrides: [
      chatRoomsProvider.overrideWith((ref) {
        return switch (rooms) {
          AsyncData(:final value) => Stream.value(value),
          AsyncError(:final error) => Stream.error(error),
          _ => const Stream.empty(),
        };
      }),
    ],
    child: const MaterialApp(home: Scaffold(body: MessageThreadsList())),
  );
}

void main() {
  group('MessageThreadsList', () {
    testWidgets('shows loading indicator while provider is loading', (
      tester,
    ) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            chatRoomsProvider.overrideWith((ref) => const Stream.empty()),
          ],
          child: const MaterialApp(home: Scaffold(body: MessageThreadsList())),
        ),
      );
      // Before stream emits, the provider is in loading state
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('shows "You have no messages." when room list is empty', (
      tester,
    ) async {
      await tester.pumpWidget(buildTestable(rooms: const AsyncData([])));
      await tester.pump(); // let stream deliver
      expect(find.text('You have no messages.'), findsOneWidget);
    });

    testWidgets('shows ListView with correct item count for non-empty list', (
      tester,
    ) async {
      const rooms = [
        Room(id: 'r-1', type: RoomType.direct, users: [], name: 'Alice'),
        Room(id: 'r-2', type: RoomType.direct, users: [], name: 'Bob'),
      ];
      await tester.pumpWidget(buildTestable(rooms: const AsyncData(rooms)));
      await tester.pump();
      expect(find.byType(ListView), findsOneWidget);
      expect(find.byType(ListTile), findsNWidgets(2));
    });

    testWidgets('shows room names in list tiles', (tester) async {
      const rooms = [
        Room(id: 'r-1', type: RoomType.direct, users: [], name: 'Charlie'),
      ];
      await tester.pumpWidget(buildTestable(rooms: const AsyncData(rooms)));
      await tester.pump();
      expect(find.text('Charlie'), findsOneWidget);
    });

    testWidgets('shows error text when provider emits error', (tester) async {
      await tester.pumpWidget(
        buildTestable(
          rooms: AsyncError(Exception('network error'), StackTrace.empty),
        ),
      );
      await tester.pump();
      expect(find.textContaining('error'), findsOneWidget);
    });
  });
}
