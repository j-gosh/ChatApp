import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'member_model.g.dart';

/// A single member inside a group. Serialized with `json_serializable`.
@JsonSerializable()
class MemberModel extends Equatable {
  const MemberModel({
    required this.userName,
    required this.first,
    required this.last,
  });

  final String userName;
  final String first;
  final String last;

  factory MemberModel.fromJson(Map<String, dynamic> json) =>
      _$MemberModelFromJson(json);

  Map<String, dynamic> toJson() => _$MemberModelToJson(this);

  @override
  List<Object?> get props => [userName, first, last];
}
