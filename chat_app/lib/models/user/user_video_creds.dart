import 'package:equatable/equatable.dart';
import 'package:stream_video_flutter/stream_video_flutter.dart';

/// Stream Video SDK credentials for a single user.
///
/// Generated at sign-up and persisted to `userVideoCredential/{uid}` in
/// Firestore. Loaded at app start to initialize the [StreamVideo] singleton.
class UserVideoCredentials extends Equatable {
  const UserVideoCredentials({required this.userInfo, required this.userToken});

  final UserInfo userInfo;
  final UserToken userToken;

  factory UserVideoCredentials.fromJson(Map<String, dynamic> json) {
    return UserVideoCredentials(
      userInfo: UserInfo(
        id: (json['user'] as Map<String, dynamic>)['id'] as String,
      ),
      userToken: UserToken.jwt(json['token'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
    'token': userToken.rawValue,
    'user': userInfo.toJson(),
  };

  @override
  List<Object?> get props => [userInfo.id, userToken.rawValue];
}
