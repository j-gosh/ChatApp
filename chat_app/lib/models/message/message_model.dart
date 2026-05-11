import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'message_model.g.dart';

/// A single chat message stored in Firestore.
///
/// [sentAt] uses [TimestampConverter] to handle Firestore [Timestamp] ↔ [DateTime].
@JsonSerializable()
class Message extends Equatable {
  const Message({
    required this.text,
    required this.sentAt,
    required this.sentByUid,
  });

  final String text;
  @TimestampConverter()
  final DateTime sentAt;
  final String sentByUid;

  factory Message.fromJson(Map<String, dynamic> json) =>
      _$MessageFromJson(json);

  Map<String, dynamic> toJson() => _$MessageToJson(this);

  @override
  List<Object?> get props => [text, sentAt, sentByUid];
}

/// Converts between Firestore [Timestamp] and Dart [DateTime] for `json_serializable`.
class TimestampConverter implements JsonConverter<DateTime, Timestamp> {
  const TimestampConverter();

  @override
  DateTime fromJson(Timestamp timestamp) => timestamp.toDate();

  @override
  Timestamp toJson(DateTime date) => Timestamp.fromDate(date);
}
