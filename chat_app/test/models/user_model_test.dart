import 'package:chat_app/models/group/group_model.dart';
import 'package:chat_app/models/user/user_model.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('UserProfile', () {
    final profileJson = {
      'userName': 'jdoe',
      'first': 'John',
      'last': 'Doe',
      'groups': [],
    };

    test('fromJson parses all fields correctly', () {
      final profile = UserProfile.fromJson(profileJson);

      expect(profile.userName, 'jdoe');
      expect(profile.first, 'John');
      expect(profile.last, 'Doe');
      expect(profile.groups, isEmpty);
    });

    test('fromJson reads "groups" key — regression for bug reading "messages"',
        () {
      final json = {
        'userName': 'x',
        'first': 'A',
        'last': 'B',
        'groups': [
          {'createdBy': 'uid-1', 'groupId': 'g-1', 'members': []},
        ],
      };
      final profile = UserProfile.fromJson(json);
      expect(profile.groups.length, 1);
      expect(profile.groups.first.groupId, 'g-1');
    });

    test('fromJson does NOT read from "messages" key', () {
      // A JSON with only "messages" key (old bug) should give empty groups
      final json = {
        'userName': 'x',
        'first': 'A',
        'last': 'B',
        'messages': [
          {'createdBy': 'uid-1', 'groupId': 'g-1', 'members': []},
        ],
        'groups': [],
      };
      final profile = UserProfile.fromJson(json);
      expect(profile.groups, isEmpty);
    });

    test('toJson round-trip produces equal object', () {
      const profile = UserProfile(
        userName: 'jdoe',
        first: 'John',
        last: 'Doe',
        groups: [],
      );
      final roundTripped = UserProfile.fromJson(profile.toJson());
      expect(roundTripped, profile);
    });

    test('Equatable equality holds for identical values', () {
      const a =
          UserProfile(userName: 'x', first: 'A', last: 'B', groups: []);
      const b =
          UserProfile(userName: 'x', first: 'A', last: 'B', groups: []);
      expect(a, equals(b));
    });

    test('groups field is typed List<GroupModel>', () {
      final json = {
        'userName': 'x',
        'first': 'A',
        'last': 'B',
        'groups': [
          {'createdBy': 'uid-1', 'groupId': 'g-1', 'members': []},
        ],
      };
      final profile = UserProfile.fromJson(json);
      expect(profile.groups.first, isA<GroupModel>());
    });
  });
}
