import 'package:chat_app/core/providers/auth/auth_providers.dart';
import 'package:chat_app/core/providers/service/service_providers.dart';
import 'package:chat_app/models/user/user_video_creds.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'video_providers.g.dart';

/// Fetches Stream Video credentials for any user by [userId].
@riverpod
Future<UserVideoCredentials> videoCredentials(Ref ref, String userId) =>
    ref.watch(videoServiceProvider).getUserVideoCredentials(userId);

/// Fetches Stream Video credentials for the currently signed-in user.
/// Throws if the user is not authenticated.
@riverpod
Future<UserVideoCredentials> currentUserVideoCredentials(Ref ref) async {
  final userId = ref.watch(currentUserIdProvider);
  if (userId == null) throw Exception('User not authenticated');
  return ref.watch(videoServiceProvider).getUserVideoCredentials(userId);
}
