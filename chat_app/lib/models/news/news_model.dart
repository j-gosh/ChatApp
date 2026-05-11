import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'news_model.g.dart';

/// A news article loaded from `assets/json/news_articles.json`.
///
/// Displayed in the Discover page's "For You" section.
@JsonSerializable()
class News extends Equatable {
  const News({
    required this.title,
    required this.thumbnail,
    required this.summary,
    required this.content,
  });

  final String title;
  final String thumbnail;
  final String summary;
  final String content;

  factory News.fromJson(Map<String, dynamic> json) => _$NewsFromJson(json);

  @override
  List<Object?> get props => [title, thumbnail, summary, content];
}
