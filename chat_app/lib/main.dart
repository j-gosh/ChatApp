import 'dart:async';

import 'package:chat_app/app.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter_android/google_maps_flutter_android.dart';
import 'package:google_maps_flutter_platform_interface/google_maps_flutter_platform_interface.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

/// Entry point. Initializes Firebase, enables the Android map renderer,
/// then runs the app inside a [ProviderScope] so all Riverpod providers work.
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  GoogleMapsFlutterPlatform mapsFlutterPlatform =
      GoogleMapsFlutterPlatform.instance;

  if (mapsFlutterPlatform is GoogleMapsFlutterAndroid) {
    mapsFlutterPlatform.useAndroidViewSurface = true;
    _initializeMapRenderer();
  }

  runApp(const ProviderScope(child: VideoTextChatApp()));
}

/// Singleton completer so map renderer init only runs once even if called
/// multiple times during startup.
Completer<AndroidMapRenderer?>? _initMapRenderCompleter;

/// Initializes the latest Android map renderer asynchronously.
/// No-ops on non-Android platforms and returns null.
Future<AndroidMapRenderer?> _initializeMapRenderer() async {
  if (_initMapRenderCompleter != null) {
    return _initMapRenderCompleter!.future;
  }
  Completer<AndroidMapRenderer?> completer = Completer<AndroidMapRenderer?>();
  _initMapRenderCompleter = completer;

  GoogleMapsFlutterPlatform mapsFlutterPlatform =
      GoogleMapsFlutterPlatform.instance;
  if (mapsFlutterPlatform is GoogleMapsFlutterAndroid) {
    unawaited(
      mapsFlutterPlatform
          .initializeWithRenderer(AndroidMapRenderer.latest)
          .then((value) => completer.complete(value)),
    );
  } else {
    completer.complete(null);
  }
  return completer.future;
}
