// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UserProfile _$UserProfileFromJson(Map<String, dynamic> json) => UserProfile(
  userName: json['userName'] as String,
  first: json['first'] as String,
  last: json['last'] as String,
  groups: (json['groups'] as List<dynamic>)
      .map((e) => GroupModel.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$UserProfileToJson(UserProfile instance) =>
    <String, dynamic>{
      'userName': instance.userName,
      'first': instance.first,
      'last': instance.last,
      'groups': instance.groups,
    };
