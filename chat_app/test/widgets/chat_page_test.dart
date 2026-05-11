import 'package:chat_app/core/providers/chat/chat_providers.dart';
import 'package:chat_app/view/chats/chat_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

Widget buildTestable() {
  return ProviderScope(
    overrides: [
      // Prevent Firebase calls from chat providers
      chatRoomsProvider.overrideWith((ref) => Stream.value([])),
      availableUsersProvider.overrideWith((ref) => Stream.value([])),
    ],
    child: const MaterialApp(home: ChatPage()),
  );
}

void main() {
  group('ChatPage', () {
    testWidgets('initial state shows Chats and New buttons (chatPageIndex 0)',
        (tester) async {
      await tester.pumpWidget(buildTestable());
      expect(find.text('Chats'), findsOneWidget);
      expect(find.text('New'), findsOneWidget);
    });

    testWidgets('initial state does NOT show Friends / Active Users buttons',
        (tester) async {
      await tester.pumpWidget(buildTestable());
      expect(find.text('Friends'), findsNothing);
      expect(find.text('Active Users'), findsNothing);
    });

    testWidgets('tapping New shows Friends and Active Users buttons',
        (tester) async {
      await tester.pumpWidget(buildTestable());
      await tester.tap(find.text('New'));
      await tester.pump();

      expect(find.text('Friends'), findsOneWidget);
      expect(find.text('Active Users'), findsOneWidget);
    });

    testWidgets('tapping Chats after New resets to chatPageIndex 0',
        (tester) async {
      await tester.pumpWidget(buildTestable());

      // Go to friends view
      await tester.tap(find.text('New'));
      await tester.pump();

      // Go back to chats view
      await tester.tap(find.text('Chats'));
      await tester.pump();

      expect(find.text('New'), findsOneWidget);
      expect(find.text('Friends'), findsNothing);
    });

    testWidgets('renders MessageThreadsList when chatPageIndex is 0',
        (tester) async {
      await tester.pumpWidget(buildTestable());
      await tester.pump(); // let stream settle

      // MessageThreadsList is rendered (empty state since we return [])
      expect(find.text('You have no messages.'), findsOneWidget);
    });
  });
}
