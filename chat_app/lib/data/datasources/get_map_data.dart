import 'dart:convert';

import 'package:flutter/services.dart';

/// Loads mock friend-location data from the bundled JSON asset.
///
/// Used by the map page to place friend markers on the Google Map.
class GetMapData {
  static const String _mapJson = 'assets/json/map_data.json';

  /// Returns the raw `users` list from `assets/json/map_data.json`.
  /// Each entry contains `id`, `location.latitude`, `location.longitude`,
  /// and `avatar_url`.
  Future readMapJson() async {
    final String response = await rootBundle.loadString(_mapJson);
    final data = await json.decode(response);
    return data['users'];
  }
}
