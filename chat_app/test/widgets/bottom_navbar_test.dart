import 'package:chat_app/core/providers/ui/ui_providers.dart';
import 'package:chat_app/view/home/bottom_navbar.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

void main() {
  group('BottomNavbar', () {
    testWidgets('renders 4 BottomNavigationBarItems', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(bottomNavigationBar: BottomNavbar()),
          ),
        ),
      );
      expect(find.byType(BottomNavigationBarItem), findsNWidgets(4));
    });

    testWidgets('reflects navigationIndexProvider initial value of 0', (
      tester,
    ) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(bottomNavigationBar: BottomNavbar()),
          ),
        ),
      );
      final navBar = tester.widget<BottomNavigationBar>(
        find.byType(BottomNavigationBar),
      );
      expect(navBar.currentIndex, 0);
    });

    testWidgets('tapping a nav item calls setIndex on the notifier', (
      tester,
    ) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(bottomNavigationBar: BottomNavbar()),
          ),
        ),
      );

      // Tap the second icon (index 1 = map)
      await tester.tap(find.byIcon(Icons.map_outlined));
      await tester.pump();

      final container = ProviderScope.containerOf(
        tester.element(find.byType(BottomNavbar)),
      );
      expect(container.read(navigationIndexProvider), 1);
    });
  });
}
