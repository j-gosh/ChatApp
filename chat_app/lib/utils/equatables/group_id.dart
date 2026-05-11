import 'package:equatable/equatable.dart';

/// Value object that uniquely identifies a group by user UID and group ID.
///
/// Extends [Equatable] so two [GroupId] instances with the same values compare
/// as equal, which is useful for provider caching and set/map keys.
class GroupId extends Equatable {
  const GroupId({required this.uId, required this.groupId});

  final String uId;
  final String groupId;

  @override
  List<Object?> get props => [uId, groupId];
}
