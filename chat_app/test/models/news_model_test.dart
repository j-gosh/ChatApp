// ignore_for_file: prefer_const_literals_to_create_immutables

import 'package:chat_app/models/news/news_model.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('News', () {
    const json = {
      'title': 'Big Event',
      'thumbnail': 'https://example.com/thumb.jpg',
      'summary': 'A short summary.',
      'content': 'Full content here.',
    };

    test('fromJson parses all fields', () {
      final news = News.fromJson(json);

      expect(news.title, 'Big Event');
      expect(news.thumbnail, 'https://example.com/thumb.jpg');
      expect(news.summary, 'A short summary.');
      expect(news.content, 'Full content here.');
    });

    test('Equatable equality holds for identical values', () {
      final a = News.fromJson(json);
      final b = News.fromJson(json);
      expect(a, equals(b));
    });

    test('Equatable inequality for different title', () {
      final a = News.fromJson(json);
      final b = News.fromJson({...json, 'title': 'Other'});
      expect(a, isNot(equals(b)));
    });
  });
}
