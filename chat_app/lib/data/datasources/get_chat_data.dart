import 'dart:convert';

import 'package:chat_app/models/user/user_model.dart';
import 'package:flutter/services.dart';

/// Loads mock user profiles from the bundled JSON asset file.
///
/// Used during development to populate the UI without a live Firestore connection.
class GetChatData {
  final _filepath = 'assets/json/snapchat_mock_data.json';

  /// Parses and returns all user profiles from `assets/json/snapchat_mock_data.json`.
  Future<List<UserProfile>> loadUsers() async {
    final String response = await rootBundle.loadString(_filepath);
    final data = json.decode(response);
    var usersFromJson = data['users'] as List;
    return usersFromJson
        .map((userJson) => UserProfile.fromJson(userJson))
        .toList();
  }
}
