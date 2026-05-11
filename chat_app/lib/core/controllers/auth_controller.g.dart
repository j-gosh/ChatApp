// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_controller.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(authController)
final authControllerProvider = AuthControllerProvider._();

final class AuthControllerProvider
    extends $FunctionalProvider<AuthController, AuthController, AuthController>
    with $Provider<AuthController> {
  AuthControllerProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'authControllerProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$authControllerHash();

  @$internal
  @override
  $ProviderElement<AuthController> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  AuthController create(Ref ref) {
    return authController(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(AuthController value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<AuthController>(value),
    );
  }
}

String _$authControllerHash() => r'c77eb1828a78365ed6790199acc0575d7a55cd06';
