// GENERATED CODE - DO NOT MODIFY BY HAND

// ignore_for_file: unused_element

part of 'memories_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Memories _$MemoriesFromJson(Map<String, dynamic> json) => Memories(
  url: json['url'] as String,
  description: json['description'] as String,
  location: json['location'] as String,
  timestamp: json['timestamp'] as String,
);

Map<String, dynamic> _$MemoriesToJson(Memories instance) => <String, dynamic>{
  'url': instance.url,
  'description': instance.description,
  'location': instance.location,
  'timestamp': instance.timestamp,
};
