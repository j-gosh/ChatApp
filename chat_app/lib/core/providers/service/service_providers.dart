import 'package:chat_app/core/services/auth_service.dart';
import 'package:chat_app/core/services/chat_service.dart';
import 'package:chat_app/core/services/user_service.dart';
import 'package:chat_app/core/services/video_service.dart';
import 'package:chat_app/models/user/user_model.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'service_providers.g.dart';

/// Provides the concrete [FirebaseAuthService] as the app's [AuthService].
/// Kept alive so auth state is never torn down while the app is running.
@Riverpod(keepAlive: true)
AuthService authService(Ref ref) => FirebaseAuthService();

/// Provides the concrete [FirestoreUserService] as the app's [UserService].
@Riverpod(keepAlive: true)
UserService userService(Ref ref) => FirestoreUserService();

/// Provides the concrete [FirebaseChatService] as the app's [ChatService].
@Riverpod(keepAlive: true)
ChatService chatService(Ref ref) => FirebaseChatService();

/// Provides the concrete [StreamVideoService] as the app's [VideoService].
@Riverpod(keepAlive: true)
VideoService videoService(Ref ref) => StreamVideoService();

@riverpod
Stream<List<UserProfile>> userFriendsList(Ref ref, String userId) {
  return ref.watch(userServiceProvider).getUserFriendsStream(userId).map((
    data,
  ) {
    return data.docs.map((friend) {
      return UserProfile.fromJson(friend.data());
    }).toList();
  });
}
