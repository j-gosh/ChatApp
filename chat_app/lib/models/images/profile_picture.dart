import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'profile_picture.g.dart';

/// A profile picture entry loaded from `assets/json/profile_picture.json`.
///
/// [image] is a local asset path shown in the app-bar avatar and profile page.
@JsonSerializable()
class ProfilePicture extends Equatable {
  const ProfilePicture({required this.image});

  final String image;

  factory ProfilePicture.fromJson(Map<String, dynamic> json) =>
      _$ProfilePictureFromJson(json);

  @override
  List<Object?> get props => [image];
}
