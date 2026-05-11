import 'dart:convert';

import 'package:chat_app/models/images/memories_model.dart';
import 'package:flutter/services.dart';

/// Loads saved photo memories from the bundled JSON asset.
class GetMemories {
  final _filepath = 'assets/json/memories.json';

  /// Parses and returns all memories from `assets/json/memories.json`.
  Future<List<Memories>> loadMemories() async {
    final String response = await rootBundle.loadString(_filepath);
    final data = json.decode(response);
    var memsFromJson = data['snapshots'] as List;
    return memsFromJson.map((memsJson) => Memories.fromJson(memsJson)).toList();
  }
}
