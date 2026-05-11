import 'package:flutter/material.dart';

/// Stories section of the Discover feed.
///
/// Currently shows a placeholder — story content is not yet implemented.
class StoryTile extends StatelessWidget {
  const StoryTile({super.key});

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.all(4.0),
      child: Column(
        children: [
          Text(
            'Stories',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
          ),
          Placeholder(),
        ],
      ),
    );
  }
}
