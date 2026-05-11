import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'stories.g.dart';

/// Placeholder model for user stories. Fields to be added when story data is defined.
@JsonSerializable()
class Stories extends Equatable {
  const Stories();

  factory Stories.fromJson(Map<String, dynamic> json) =>
      _$StoriesFromJson(json);

  Map<String, dynamic> toJson() => _$StoriesToJson(this);

  @override
  List<Object?> get props => [];
}
