import 'package:chat_app/core/providers/ui/ui_providers.dart';
import 'package:flutter_test/flutter_test.dart';

import '../helpers/provider_test_helper.dart';

void main() {
  group('NavigationIndex', () {
    test('initial value is 0', () {
      final container = makeContainer();
      addTearDown(container.dispose);
      expect(container.read(navigationIndexProvider), 0);
    });

    test('setIndex updates state', () {
      final container = makeContainer();
      addTearDown(container.dispose);

      container.read(navigationIndexProvider.notifier).setIndex(3);
      expect(container.read(navigationIndexProvider), 3);
    });
  });

  group('ChatPageIndex', () {
    test('initial value is 0', () {
      final container = makeContainer();
      addTearDown(container.dispose);
      expect(container.read(chatPageIndexProvider), 0);
    });

    test('setIndex updates state', () {
      final container = makeContainer();
      addTearDown(container.dispose);

      container.read(chatPageIndexProvider.notifier).setIndex(1);
      expect(container.read(chatPageIndexProvider), 1);
    });
  });

  group('FriendsPageIndex', () {
    test('initial value is 0', () {
      final container = makeContainer();
      addTearDown(container.dispose);
      expect(container.read(friendsPageIndexProvider), 0);
    });

    test('setIndex updates state', () {
      final container = makeContainer();
      addTearDown(container.dispose);

      container.read(friendsPageIndexProvider.notifier).setIndex(1);
      expect(container.read(friendsPageIndexProvider), 1);
    });
  });
}
