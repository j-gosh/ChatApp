// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'message_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Message _$MessageFromJson(Map<String, dynamic> json) => Message(
  text: json['text'] as String,
  sentAt: const TimestampConverter().fromJson(json['sentAt'] as Timestamp),
  sentByUid: json['sentByUid'] as String,
);

Map<String, dynamic> _$MessageToJson(Message instance) => <String, dynamic>{
  'text': instance.text,
  'sentAt': const TimestampConverter().toJson(instance.sentAt),
  'sentByUid': instance.sentByUid,
};
