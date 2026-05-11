import 'package:chat_app/core/providers/service/service_providers.dart';
import 'package:chat_app/core/services/auth_service.dart';
import 'package:chat_app/core/services/chat_service.dart';
import 'package:chat_app/core/services/user_service.dart';
import 'package:chat_app/core/services/video_service.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

ProviderContainer makeContainer({
  AuthService? authService,
  ChatService? chatService,
  UserService? userService,
  VideoService? videoService,
}) {
  return ProviderContainer(
    overrides: [
      if (authService != null)
        authServiceProvider.overrideWithValue(authService),
      if (chatService != null)
        chatServiceProvider.overrideWithValue(chatService),
      if (userService != null)
        userServiceProvider.overrideWithValue(userService),
      if (videoService != null)
        videoServiceProvider.overrideWithValue(videoService),
    ],
  );
}
