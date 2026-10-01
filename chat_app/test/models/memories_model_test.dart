import 'package:chat_app/models/images/memories_model.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Memories', () {
    const json = {
      'url': 'https://example.com/image.jpg',
      'description': 'A memory',
      'location': 'New York',
      'timestamp': '2024-01-01',
    };

    test('fromJson parses all fields', () {
      final mem = Memories.fromJson(json);

      expect(mem.url, 'https://example.com/image.jpg');
      expect(mem.description, 'A memory');
      expect(mem.location, 'New York');
      expect(mem.timestamp, '2024-01-01');
    });

    test('Equatable equality holds for identical values', () {
      final a = Memories.fromJson(json);
      final b = Memories.fromJson(json);
      expect(a, equals(b));
    });

    test('Equatable inequality for different values', () {
      final a = Memories.fromJson(json);
      // ignore: prefer_const_literals_to_create_immutables
      final b = Memories.fromJson({...json, 'url': 'other.jpg'});
      expect(a, isNot(equals(b)));
    });
  });
}
