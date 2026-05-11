import 'package:chat_app/models/message/message_model.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Message', () {
    test('fromJson converts Timestamp to DateTime — regression for raw assignment bug',
        () {
      final timestamp = Timestamp.fromMillisecondsSinceEpoch(1_000_000_000);
      final json = {
        'text': 'Hello',
        'sentAt': timestamp,
        'sentByUid': 'uid-1',
      };

      final message = Message.fromJson(json);

      expect(message.text, 'Hello');
      expect(message.sentAt, timestamp.toDate());
      expect(message.sentByUid, 'uid-1');
    });

    test('toJson converts DateTime back to Timestamp', () {
      final dt = DateTime.fromMillisecondsSinceEpoch(1_000_000_000);
      final message = Message(text: 'Hi', sentAt: dt, sentByUid: 'uid-2');
      final json = message.toJson();

      expect(json['text'], 'Hi');
      expect(json['sentAt'], isA<Timestamp>());
      expect((json['sentAt'] as Timestamp).toDate(), dt);
    });

    test('toJson/fromJson round-trip produces equal object', () {
      final dt = DateTime.fromMillisecondsSinceEpoch(1_000_000_000);
      final original = Message(text: 'Round trip', sentAt: dt, sentByUid: 'uid-3');
      final roundTripped = Message.fromJson(original.toJson());
      expect(roundTripped, original);
    });

    test('Equatable equality holds for identical values', () {
      final dt = DateTime(2024, 1, 1);
      final a = Message(text: 'Hi', sentAt: dt, sentByUid: 'uid-1');
      final b = Message(text: 'Hi', sentAt: dt, sentByUid: 'uid-1');
      expect(a, equals(b));
    });
  });
}
