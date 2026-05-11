import 'package:flutter/material.dart';

/// Centered adaptive loading spinner sized at 150×150.
///
/// Drop-in replacement for any full-screen loading state.
class LoadingAnimation extends StatelessWidget {
  const LoadingAnimation({super.key});

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      height: 150,
      width: 150,
      child: CircularProgressIndicator.adaptive(),
    );
  }
}
