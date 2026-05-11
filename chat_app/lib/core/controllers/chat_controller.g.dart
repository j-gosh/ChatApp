// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'chat_controller.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(chatController)
final chatControllerProvider = ChatControllerProvider._();

final class ChatControllerProvider
    extends $FunctionalProvider<ChatController, ChatController, ChatController>
    with $Provider<ChatController> {
  ChatControllerProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'chatControllerProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$chatControllerHash();

  @$internal
  @override
  $ProviderElement<ChatController> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  ChatController create(Ref ref) {
    return chatController(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(ChatController value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<ChatController>(value),
    );
  }
}

String _$chatControllerHash() => r'1c7e0e81e98b99eaf6ca52b1611b4c20c56ae910';
