import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'memories_model.g.dart';

/// A saved photo memory loaded from `assets/json/memories.json`.
///
/// Displayed in the profile page's Memories grid.
@JsonSerializable()
class Memories extends Equatable {
  const Memories({
    required this.url,
    required this.description,
    required this.location,
    required this.timestamp,
  });

  final String url;
  final String description;
  final String location;
  final String timestamp;

  factory Memories.fromJson(Map<String, dynamic> json) =>
      _$MemoriesFromJson(json);

  @override
  List<Object?> get props => [url, description, location, timestamp];
}
