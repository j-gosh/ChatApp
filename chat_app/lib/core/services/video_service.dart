import 'package:chat_app/models/user/user_video_creds.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:stream_video/stream_video.dart' as stream;

/// Contract for Stream Video credential management.
///
/// Credentials are generated once at sign-up and persisted to the
/// `userVideoCredential/{uid}` Firestore collection.
/// The concrete implementation is [StreamVideoService].
abstract class VideoService {
  /// Persists [credentials] to Firestore for [userId].
  Future<void> saveUserVideoCredentials(
    String userId,
    UserVideoCredentials credentials,
  );

  /// Reads persisted credentials from Firestore for [userId].
  Future<UserVideoCredentials> getUserVideoCredentials(String userId);

  /// Generates a new [UserVideoCredentials] (JWT token + user info) for [userId].
  /// Does NOT persist — call [saveUserVideoCredentials] afterwards.
  UserVideoCredentials generateVideoCredentials(String userId);
}

/// Stream Video SDK-backed implementation of [VideoService].
class StreamVideoService implements VideoService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  @override
  Future<void> saveUserVideoCredentials(
    String userId,
    UserVideoCredentials credentials,
  ) {
    return _firestore
        .collection('userVideoCredential')
        .doc(userId)
        .set(credentials.toJson());
  }

  @override
  Future<UserVideoCredentials> getUserVideoCredentials(String userId) async {
    final doc = await _firestore
        .collection('userVideoCredential')
        .doc(userId)
        .get();
    final data = doc.data();
    if (data == null) {
      throw Exception('Video credentials not found for user: $userId');
    }
    return UserVideoCredentials.fromJson(data);
  }

  @override
  UserVideoCredentials generateVideoCredentials(String userId) {
    final userInfo = stream.UserInfo(id: userId);
    final userToken = stream.UserToken.jwt(userId);
    return UserVideoCredentials(userInfo: userInfo, userToken: userToken);
  }
}

const String apiKey = '';
