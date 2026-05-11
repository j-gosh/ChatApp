import 'package:chat_app/view/discover/widgets/for_you_tile.dart';
import 'package:chat_app/view/discover/widgets/story_tile.dart';
import 'package:chat_app/view/discover/widgets/sub_tile.dart';
import 'package:chat_app/view/profile/widgets/avatar.dart';
import 'package:flutter/material.dart';

/// Discover feed shown at `/discover` and nav index 3.
///
/// Contains three sections stacked vertically:
/// - [SubTile]: horizontal subscriptions carousel
/// - [ForYouTile]: personalized news articles grid
/// - [StoryTile]: friends' stories (placeholder)
class DiscoverPage extends StatefulWidget {
  const DiscoverPage({super.key});

  @override
  State<DiscoverPage> createState() => _DiscoverPageState();
}

class _DiscoverPageState extends State<DiscoverPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: const Text('Discover'),
          actions: const [ProfileAvatar()],
        ),
        body: Stack(
          children: [
            ListView(
              physics: const ClampingScrollPhysics(),
              shrinkWrap: true,
              children: const [
                SubTile(),
                Divider(
                  color: Colors.black,
                ),
                ForYouTile(),
                Divider(
                  color: Colors.black,
                ),
                StoryTile(),
                Divider(
                  color: Colors.black,
                ),
                SizedBox(
                  height: 70,
                )
              ],
            ),
          ],
        ));
  }
}
