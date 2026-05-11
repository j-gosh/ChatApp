import 'package:chat_app/core/providers/ui/ui_providers.dart';
import 'package:chat_app/widgets/navbar/navbar.dart';
import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

/// Bottom navigation bar for the main shell.
///
/// Renders four tabs (Chat, Map, Video, Discover) and syncs the selected tab
/// with [navigationIndexProvider].
class BottomNavbar extends ConsumerStatefulWidget {
  const BottomNavbar({super.key});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() {
    return _BottomNavbarState();
  }
}

class _BottomNavbarState extends ConsumerState<BottomNavbar> {
  @override
  Widget build(BuildContext context) {
    final currentIndex = ref.watch(navigationIndexProvider);
    return NavBar(
      items: const [
        BottomNavigationBarItem(label: '', icon: Icon(Icons.chat)),
        BottomNavigationBarItem(label: '', icon: Icon(Icons.map_outlined)),
        BottomNavigationBarItem(label: '', icon: Icon(Icons.video_call)),
        BottomNavigationBarItem(label: '', icon: Icon(Icons.search)),
      ],
      currentIndex: currentIndex,
      onTap: (value) {
        ref.read(navigationIndexProvider.notifier).setIndex(value);
      },
    );
  }
}
