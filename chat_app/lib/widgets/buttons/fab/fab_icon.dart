import 'package:chat_app/utils/theme/app_theme.dart';
import 'package:flutter/material.dart';

/// A circular icon button with a text label underneath, styled for use as an
/// expanding FAB child action.
class FABIcon extends StatelessWidget {
  const FABIcon(
      {super.key,
      required this.onPressed,
      required this.icon,
      required this.text});

  final VoidCallback? onPressed;
  final Widget icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Ink(
          decoration: ShapeDecoration(
            color: AppTheme.appTheme.floatingActionButtonTheme.backgroundColor,
            shape: const CircleBorder(),
          ),
          child: IconButton(
            onPressed: onPressed,
            icon: icon,
            color: Colors.white,
          ),
        ),
        Text(text),
      ],
    );
  }
}
