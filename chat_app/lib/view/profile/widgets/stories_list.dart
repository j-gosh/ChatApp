import 'package:chat_app/data/datasources/get_memories.dart';
import 'package:chat_app/models/images/memories_model.dart';
import 'package:flutter/material.dart';

/// 3-column grid of stories shown on the profile page's Stories tab.
///
/// Currently reuses memories data from [GetMemories] as a placeholder
/// until real story data is available.
class StoriesList extends StatefulWidget {
  const StoriesList({super.key});

  @override
  State<StoriesList> createState() => _StoriesListState();
}

class _StoriesListState extends State<StoriesList> {
  final GetMemories _getMemories = GetMemories();

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: _getMemories.loadMemories(),
      builder: (context, snapshot) {
        if (snapshot.hasData &&
            snapshot.connectionState == ConnectionState.done) {
          return SizedBox(
            height: MediaQuery.of(context).size.height * 0.35,
            width: MediaQuery.of(context).size.width - 5,
            child: GridView.builder(
              physics: const ClampingScrollPhysics(),
              scrollDirection: Axis.vertical,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                childAspectRatio: 9.9 / 15.7,
              ),
              itemCount: 5,
              itemBuilder: (context, index) {
                Memories memories = snapshot.data![index];
                return Container(
                  height: 150,
                  width: 200,
                  decoration: BoxDecoration(
                    border: Border.all(color: const Color(0xff000000)),
                    borderRadius: BorderRadius.circular(6.0),
                    image: DecorationImage(
                      image: Image.asset(memories.url).image,
                    ),
                  ),
                );
              },
            ),
          );
        } else if (snapshot.data == null ||
            snapshot.hasError ||
            snapshot.connectionState == ConnectionState.none) {
          return const Center(child: Text('errore'));
        }
        return const CircularProgressIndicator();
      },
    );
  }
}
