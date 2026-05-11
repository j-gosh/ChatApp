import 'package:chat_app/core/providers/ui/ui_providers.dart';
import 'package:chat_app/view/chats/chat_page.dart';
import 'package:chat_app/view/discover/discover.dart';
import 'package:chat_app/view/home/bottom_navbar.dart';
import 'package:chat_app/view/map/map_page.dart';
import 'package:chat_app/view/video_chat/chat_screen.dart';
import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

/// Main shell screen rendered at `/`.
///
/// Uses an [IndexedStack] to keep all four tabs alive (Chat, Map, Video,
/// Discover) while switching between them via [BottomNavbar]. The active tab
/// index is driven by [navigationIndexProvider].
class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() {
    return _HomePageState();
  }
}

class _HomePageState extends ConsumerState<HomePage> {
  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final currentIndex = ref.watch(navigationIndexProvider);
    return Scaffold(
      body: IndexedStack(
        index: currentIndex,
        children: const [
          ChatPage(),
          MapPage(),
          VideoChatScreen(),
          DiscoverPage(),
        ],
      ),
      bottomNavigationBar: const BottomNavbar(),
    );
  }
}
