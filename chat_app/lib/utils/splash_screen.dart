import 'package:flutter/material.dart';

/// Shown at `/splash` while Firebase auth state is being resolved.
///
/// The GoRouter redirect in `routes.dart` replaces this route with either
/// `/onboarding` or `/` once the auth state is known.
class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          SizedBox(
            height: 250,
            width: MediaQuery.of(context).size.width - 20,
            child: const FlutterLogo(),
          ),
          const Center(
            child: CircularProgressIndicator.adaptive(),
          ),
        ],
      ),
    );
  }
}
