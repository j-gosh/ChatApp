import 'package:chat_app/core/services/auth_service.dart';
import 'package:chat_app/core/services/chat_service.dart';
import 'package:chat_app/core/services/user_service.dart';
import 'package:chat_app/core/services/video_service.dart';
import 'package:mocktail/mocktail.dart';

class MockAuthService extends Mock implements AuthService {}

class MockChatService extends Mock implements ChatService {}

class MockUserService extends Mock implements UserService {}

class MockVideoService extends Mock implements VideoService {}
