import 'package:flutter/material.dart';

/// Reusable card-wrapped list tile with a text leading widget.
///
/// Used wherever a simple tappable list row is needed throughout the app.
class ListCardTile extends StatelessWidget {
  const ListCardTile(
      {super.key, required this.leadingData, required this.onTap});

  final String leadingData;
  final void Function() onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.white70,
      child: ListTile(
        textColor: Colors.black,
        style: ListTileStyle.list,
        leading: Text(leadingData),
        onTap: onTap,
      ),
    );
  }
}
