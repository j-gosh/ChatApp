import 'package:chat_app/models/group/group_model.dart';
import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

/// Firestore profile document for a registered user.
///
/// Stored at `profileData/{uid}`. Serialized with `json_serializable`.
@JsonSerializable()
class UserProfile extends Equatable {
  const UserProfile({
    required this.userName,
    required this.first,
    required this.last,
    required this.groups,
  });

  final String userName;
  final String first;
  final String last;
  final List<GroupModel> groups;

  factory UserProfile.fromJson(Map<String, dynamic> json) =>
      _$UserProfileFromJson(json);

  Map<String, dynamic> toJson() => _$UserProfileToJson(this);

  @override
  List<Object?> get props => [userName, first, last, groups];
}
