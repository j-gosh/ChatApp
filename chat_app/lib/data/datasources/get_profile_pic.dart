import 'dart:convert';

import 'package:chat_app/models/images/profile_picture.dart';
import 'package:flutter/services.dart';

/// Loads the current user's profile picture from the bundled JSON asset.
class GetProfilePic {
  final _filepath = 'assets/json/profile_picture.json';

  /// Parses and returns all profile picture entries from
  /// `assets/json/profile_picture.json`. The first entry is used as the
  /// active avatar.
  Future<List<ProfilePicture>> loadProfilePicture() async {
    final String response = await rootBundle.loadString(_filepath);
    final data = json.decode(response);
    var pictureFromJson = data['snapshots'] as List;
    return pictureFromJson
        .map((json) => ProfilePicture.fromJson(json))
        .toList();
  }
}
