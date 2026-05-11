import 'package:chat_app/models/group/member_model.dart';
import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'group_model.g.dart';

/// Represents a chat group with a creator and a list of members.
///
/// Embedded inside a user profile's groups list. Serialized with `json_serializable`.
@JsonSerializable()
class GroupModel extends Equatable {
  const GroupModel({
    required this.createdBy,
    required this.groupId,
    required this.members,
  });

  final String createdBy;
  final String groupId;
  final List<MemberModel> members;

  factory GroupModel.fromJson(Map<String, dynamic> json) =>
      _$GroupModelFromJson(json);

  Map<String, dynamic> toJson() => _$GroupModelToJson(this);

  @override
  List<Object?> get props => [createdBy, groupId, members];
}
