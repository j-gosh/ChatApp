import 'package:flutter/material.dart';

/// Read-only profile view for another user, shown at
/// `/selected/:name/:snaps/:following/:image`.
///
/// All data is passed as path parameters — no additional network requests
/// are made when this screen opens.
class SelectedProfile extends StatefulWidget {
  const SelectedProfile(
      {super.key,
      required this.name,
      required this.snaps,
      required this.following,
      required this.image});

  final String name;
  final String snaps;
  final String following;
  final String image;

  @override
  State<SelectedProfile> createState() => _SelectedProfileState();
}

class _SelectedProfileState extends State<SelectedProfile> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.only(top: 10.0),
            height: MediaQuery.of(context).size.height * 0.20,
            width: MediaQuery.of(context).size.width - 2,
            child: Padding(
              padding: const EdgeInsets.all(10.0),
              child: Center(
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 50,
                      backgroundImage: NetworkImage(widget.image),
                      backgroundColor: Colors.amber,
                    ),
                    Text(widget.name),
                  ],
                ),
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.all(10.0),
            height: MediaQuery.of(context).size.height * 0.15,
            width: MediaQuery.of(context).size.width - 20,
            child: Padding(
              padding: const EdgeInsets.all(10.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Column(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      const Text('snap totals',
                          style: TextStyle(color: Colors.black)),
                      Text(widget.snaps,
                          style: const TextStyle(color: Colors.black))
                    ],
                  ),
                  Column(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      const Text('Following',
                          style: TextStyle(color: Colors.black)),
                      Text(widget.following,
                          style: const TextStyle(color: Colors.black)),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
