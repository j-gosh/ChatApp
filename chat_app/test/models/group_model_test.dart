import 'package:chat_app/models/group/group_model.dart';
import 'package:chat_app/models/group/member_model.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('GroupModel', () {
    final memberJson = {'userName': 'jdoe', 'first': 'John', 'last': 'Doe'};
    final groupJson = {
      'createdBy': 'uid-1',
      'groupId': 'g-1',
      'members': [memberJson],
    };

    test('fromJson parses all fields', () {
      final group = GroupModel.fromJson(groupJson);

      expect(group.createdBy, 'uid-1');
      expect(group.groupId, 'g-1');
      expect(group.members.length, 1);
      expect(group.members.first.first, 'John');
    });

    test('fromJson with empty members list', () {
      final json = {'createdBy': 'uid-1', 'groupId': 'g-1', 'members': []};
      final group = GroupModel.fromJson(json);
      expect(group.members, isEmpty);
    });

    test('toJson round-trip produces equal object', () {
      const member = MemberModel(userName: 'jdoe', first: 'John', last: 'Doe');
      const group = GroupModel(
        createdBy: 'uid-1',
        groupId: 'g-1',
        members: [member],
      );
      final roundTripped = GroupModel.fromJson(group.toJson());
      expect(roundTripped, group);
    });

    test('Equatable equality holds for identical values', () {
      const member = MemberModel(userName: 'jdoe', first: 'John', last: 'Doe');
      const a = GroupModel(createdBy: 'x', groupId: 'g', members: [member]);
      const b = GroupModel(createdBy: 'x', groupId: 'g', members: [member]);
      expect(a, equals(b));
    });
  });
}
