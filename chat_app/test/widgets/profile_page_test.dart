import 'package:chat_app/view/profile/profile_page.dart';
import 'package:chat_app/view/profile/widgets/memories_list.dart';
import 'package:chat_app/view/profile/widgets/snap_list.dart';
import 'package:chat_app/view/profile/widgets/stories_list.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

void main() {
  Widget buildTestable() => const ProviderScope(
        child: MaterialApp(home: ProfilePage()),
      );

  group('ProfilePage', () {
    testWidgets('renders user avatar', (tester) async {
      await tester.pumpWidget(buildTestable());
      expect(find.byType(CircleAvatar), findsOneWidget);
    });

    testWidgets('renders Snap Totals stat', (tester) async {
      await tester.pumpWidget(buildTestable());
      expect(find.text('Snap Totals'), findsOneWidget);
    });

    testWidgets('renders Friends stat', (tester) async {
      await tester.pumpWidget(buildTestable());
      expect(find.text('Friends'), findsOneWidget);
    });

    testWidgets('renders Following stat', (tester) async {
      await tester.pumpWidget(buildTestable());
      expect(find.text('Following'), findsOneWidget);
    });

    testWidgets('renders Snaps, Stories, Memories tab buttons', (tester) async {
      await tester.pumpWidget(buildTestable());
      expect(find.text('Snaps'), findsOneWidget);
      expect(find.text('Stories'), findsOneWidget);
      expect(find.text('Memories'), findsOneWidget);
    });

    testWidgets('settings icon button is present in AppBar', (tester) async {
      await tester.pumpWidget(buildTestable());
      expect(find.byIcon(Icons.settings), findsOneWidget);
    });

    testWidgets('default selected tab shows SnapList widget', (tester) async {
      await tester.pumpWidget(buildTestable());
      expect(find.byType(SnapList), findsOneWidget);
      expect(find.byType(StoriesList), findsNothing);
      expect(find.byType(MemoriesList), findsNothing);
    });

    testWidgets('tapping Stories tab switches to StoriesList', (tester) async {
      await tester.pumpWidget(buildTestable());
      await tester.tap(find.text('Stories'));
      await tester.pump();
      expect(find.byType(StoriesList), findsOneWidget);
      expect(find.byType(SnapList), findsNothing);
    });

    testWidgets('tapping Memories tab switches to MemoriesList',
        (tester) async {
      await tester.pumpWidget(buildTestable());
      await tester.tap(find.text('Memories'));
      await tester.pump();
      expect(find.byType(MemoriesList), findsOneWidget);
      expect(find.byType(SnapList), findsNothing);
    });
  });
}
