import 'package:chat_app/core/providers/auth/auth_providers.dart';
import 'package:chat_app/utils/splash_screen.dart';
import 'package:chat_app/view/onboarding/onboarding.dart';
import 'package:chat_app/view/chats/friends/friends_list.dart';
import 'package:chat_app/view/home/home_page.dart';
import 'package:chat_app/view/camera/camera.dart';
import 'package:chat_app/view/chats/chat_page.dart';
import 'package:chat_app/view/discover/discover.dart';
import 'package:chat_app/view/chats/messages/messages_view.dart';
import 'package:chat_app/view/profile/widgets/selected.dart';
import 'package:chat_app/view/profile/profile_page.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'routes.g.dart';

/// Determines where GoRouter should redirect based on current auth state.
///
/// Returns null to mean "stay on the current route".
/// - While loading or on error: no redirect (avoids redirect loops).
/// - `/splash` → home if authenticated, `/onboarding` if not.
/// - `/onboarding` → home if already authenticated.
/// - Any other route → `/splash` if unauthenticated.
String? computeRedirect(AsyncValue<User?> authAsync, String location) {
  if (authAsync.isLoading || authAsync.hasError) return null;
  final isAuth = authAsync.asData?.value != null;
  if (location == '/splash') return isAuth ? '/' : '/onboarding';
  if (location == '/onboarding') return isAuth ? '/' : null;
  return isAuth ? null : '/splash';
}

/// Bridges Riverpod auth state changes into a [ChangeNotifier] so GoRouter
/// can refresh its redirect logic whenever auth state changes.
class _RouterNotifier extends ChangeNotifier {
  _RouterNotifier(Ref ref) {
    ref.listen(authStateProvider, (previous, next) => notifyListeners());
  }
}

/// Riverpod provider that creates and owns the app's [GoRouter].
///
/// Kept alive so the router is never recreated during the app's lifetime.
/// Registers [_RouterNotifier] as the refresh listenable so any Firebase
/// auth state change triggers route re-evaluation.
///
/// Routes defined:
/// - `/`            — [HomePage] (main shell with bottom nav)
/// - `/discover`    — [DiscoverPage]
/// - `/camera`      — [CameraDisplay]
/// - `/chat`        — [ChatPage]
/// - `/messages`    — [MessagesView] (requires `selectedRoom` to be set first)
/// - `/profile`     — [ProfilePage]
/// - `/friends`     — [FriendsList]
/// - `/selected/:name/:snaps/:following/:image` — [SelectedProfile]
/// - `/splash`      — [SplashScreen] (shown while auth state is resolving)
/// - `/onboarding`  — [OnboardingPage] (login / register / forgot-password)
@Riverpod(keepAlive: true)
GoRouter router(Ref ref) {
  final notifier = _RouterNotifier(ref);
  ref.onDispose(notifier.dispose);

  return GoRouter(
    refreshListenable: notifier,
    routes: [
      GoRoute(path: '/', builder: (context, state) => const HomePage()),
      GoRoute(
        path: '/discover',
        builder: (context, state) => const DiscoverPage(),
      ),
      GoRoute(
        path: '/camera',
        builder: (context, state) => const CameraDisplay(),
      ),
      GoRoute(path: '/chat', builder: (context, state) => const ChatPage()),
      GoRoute(
        path: '/messages',
        name: 'messages',
        builder: (context, state) => const MessagesView(),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfilePage(),
      ),
      GoRoute(
        path: '/friends',
        builder: (context, state) => const FriendsList(),
      ),
      GoRoute(
        path: '/selected/:name/:snaps/:following/:image',
        name: 'selected',
        builder: (context, state) => SelectedProfile(
          name: state.pathParameters['name']!,
          snaps: state.pathParameters['snaps']!,
          following: state.pathParameters['following']!,
          image: state.pathParameters['image']!,
        ),
      ),
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingPage(),
      ),
    ],
    redirect: (context, state) =>
        computeRedirect(ref.read(authStateProvider), state.matchedLocation),
  );
}
