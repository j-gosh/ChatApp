// GENERATED CODE - DO NOT MODIFY BY HAND

// ignore_for_file: unused_element

part of 'news_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

News _$NewsFromJson(Map<String, dynamic> json) => News(
  title: json['title'] as String,
  thumbnail: json['thumbnail'] as String,
  summary: json['summary'] as String,
  content: json['content'] as String,
);

Map<String, dynamic> _$NewsToJson(News instance) => <String, dynamic>{
  'title': instance.title,
  'thumbnail': instance.thumbnail,
  'summary': instance.summary,
  'content': instance.content,
};
