import 'package:chat_app/models/images/profile_picture.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('ProfilePicture', () {
    test('fromJson parses image field', () {
      final pic = ProfilePicture.fromJson(const {
        'image': 'https://example.com/pic.jpg',
      });
      expect(pic.image, 'https://example.com/pic.jpg');
    });

    test('Equatable equality for identical values', () {
      const a = ProfilePicture(image: 'a.jpg');
      const b = ProfilePicture(image: 'a.jpg');
      expect(a, equals(b));
    });

    test('Equatable inequality for different values', () {
      const a = ProfilePicture(image: 'a.jpg');
      const b = ProfilePicture(image: 'b.jpg');
      expect(a, isNot(equals(b)));
    });
  });
}
