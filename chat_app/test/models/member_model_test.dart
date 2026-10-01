import 'package:chat_app/models/group/member_model.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('MemberModel', () {
    test('fromJson parses all fields correctly', () {
      final json = {'userName': 'jdoe', 'first': 'John', 'last': 'Doe'};

      final member = MemberModel.fromJson(json);

      expect(member.userName, 'jdoe');
      expect(member.first, 'John');
      expect(member.last, 'Doe');
    });

    test('fromJson reads "first" key — regression for typo "firs"', () {
      final json = {'userName': 'a', 'first': 'Alice', 'last': 'B'};
      final member = MemberModel.fromJson(json);
      expect(member.first, 'Alice');
    });

    test('toJson round-trip produces equal object', () {
      const member = MemberModel(userName: 'jdoe', first: 'John', last: 'Doe');
      final roundTripped = MemberModel.fromJson(member.toJson());
      expect(roundTripped, member);
    });

    test('Equatable equality holds for identical values', () {
      const a = MemberModel(userName: 'x', first: 'A', last: 'B');
      const b = MemberModel(userName: 'x', first: 'A', last: 'B');
      expect(a, equals(b));
    });

    test('Equatable inequality holds for different values', () {
      const a = MemberModel(userName: 'x', first: 'A', last: 'B');
      const b = MemberModel(userName: 'y', first: 'A', last: 'B');
      expect(a, isNot(equals(b)));
    });
  });
}
