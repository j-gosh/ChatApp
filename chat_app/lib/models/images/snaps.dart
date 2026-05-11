import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'snaps.g.dart';

/// Placeholder model for user snaps. Fields to be added when snap data is defined.
@JsonSerializable()
class Snaps extends Equatable {
  const Snaps();

  factory Snaps.fromJson(Map<String, dynamic> json) => _$SnapsFromJson(json);

  Map<String, dynamic> toJson() => _$SnapsToJson(this);

  @override
  List<Object?> get props => [];
}
