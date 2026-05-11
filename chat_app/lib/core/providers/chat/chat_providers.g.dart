// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'chat_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// Live stream of all chat rooms the current user belongs to, ordered by most
/// recently updated.

@ProviderFor(chatRooms)
final chatRoomsProvider = ChatRoomsProvider._();

/// Live stream of all chat rooms the current user belongs to, ordered by most
/// recently updated.

final class ChatRoomsProvider
    extends
        $FunctionalProvider<
          AsyncValue<List<Room>>,
          List<Room>,
          Stream<List<Room>>
        >
    with $FutureModifier<List<Room>>, $StreamProvider<List<Room>> {
  /// Live stream of all chat rooms the current user belongs to, ordered by most
  /// recently updated.
  ChatRoomsProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'chatRoomsProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$chatRoomsHash();

  @$internal
  @override
  $StreamProviderElement<List<Room>> $createElement($ProviderPointer pointer) =>
      $StreamProviderElement(pointer);

  @override
  Stream<List<Room>> create(Ref ref) {
    return chatRooms(ref);
  }
}

String _$chatRoomsHash() => r'1b97e0584d36b37614b08e0a0388d2c2a6da00e1';

/// Live stream of messages inside [room], newest first.

@ProviderFor(chatMessages)
final chatMessagesProvider = ChatMessagesFamily._();

/// Live stream of messages inside [room], newest first.

final class ChatMessagesProvider
    extends
        $FunctionalProvider<
          AsyncValue<List<Message>>,
          List<Message>,
          Stream<List<Message>>
        >
    with $FutureModifier<List<Message>>, $StreamProvider<List<Message>> {
  /// Live stream of messages inside [room], newest first.
  ChatMessagesProvider._({
    required ChatMessagesFamily super.from,
    required Room super.argument,
  }) : super(
         retry: null,
         name: r'chatMessagesProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$chatMessagesHash();

  @override
  String toString() {
    return r'chatMessagesProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  $StreamProviderElement<List<Message>> $createElement(
    $ProviderPointer pointer,
  ) => $StreamProviderElement(pointer);

  @override
  Stream<List<Message>> create(Ref ref) {
    final argument = this.argument as Room;
    return chatMessages(ref, argument);
  }

  @override
  bool operator ==(Object other) {
    return other is ChatMessagesProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$chatMessagesHash() => r'8f525c6aba4f5463386cfea8fad4d31de65d5eca';

/// Live stream of messages inside [room], newest first.

final class ChatMessagesFamily extends $Family
    with $FunctionalFamilyOverride<Stream<List<Message>>, Room> {
  ChatMessagesFamily._()
    : super(
        retry: null,
        name: r'chatMessagesProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  /// Live stream of messages inside [room], newest first.

  ChatMessagesProvider call(Room room) =>
      ChatMessagesProvider._(argument: room, from: this);

  @override
  String toString() => r'chatMessagesProvider';
}

/// Live stream of all registered users visible to the chat SDK
/// (used to populate the "new conversation" user picker).

@ProviderFor(availableUsers)
final availableUsersProvider = AvailableUsersProvider._();

/// Live stream of all registered users visible to the chat SDK
/// (used to populate the "new conversation" user picker).

final class AvailableUsersProvider
    extends
        $FunctionalProvider<
          AsyncValue<List<User>>,
          List<User>,
          Stream<List<User>>
        >
    with $FutureModifier<List<User>>, $StreamProvider<List<User>> {
  /// Live stream of all registered users visible to the chat SDK
  /// (used to populate the "new conversation" user picker).
  AvailableUsersProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'availableUsersProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$availableUsersHash();

  @$internal
  @override
  $StreamProviderElement<List<User>> $createElement($ProviderPointer pointer) =>
      $StreamProviderElement(pointer);

  @override
  Stream<List<User>> create(Ref ref) {
    return availableUsers(ref);
  }
}

String _$availableUsersHash() => r'be548f82303044e3e4693083e1fd5b76e941a796';

/// Holds the room that the user is currently viewing in the messages screen.
///
/// Set to a [Room] before navigating to `/messages`; cleared when leaving.

@ProviderFor(SelectedRoom)
final selectedRoomProvider = SelectedRoomProvider._();

/// Holds the room that the user is currently viewing in the messages screen.
///
/// Set to a [Room] before navigating to `/messages`; cleared when leaving.
final class SelectedRoomProvider
    extends $NotifierProvider<SelectedRoom, Room?> {
  /// Holds the room that the user is currently viewing in the messages screen.
  ///
  /// Set to a [Room] before navigating to `/messages`; cleared when leaving.
  SelectedRoomProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'selectedRoomProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$selectedRoomHash();

  @$internal
  @override
  SelectedRoom create() => SelectedRoom();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(Room? value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<Room?>(value),
    );
  }
}

String _$selectedRoomHash() => r'cad1adb92d6db22a6b71c0218760d19a5d0d0a86';

/// Holds the room that the user is currently viewing in the messages screen.
///
/// Set to a [Room] before navigating to `/messages`; cleared when leaving.

abstract class _$SelectedRoom extends $Notifier<Room?> {
  Room? build();
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<Room?, Room?>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<Room?, Room?>,
              Room?,
              Object?,
              Object?
            >;
    element.handleCreate(ref, build);
  }
}
