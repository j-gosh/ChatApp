import 'package:flutter/material.dart';

/// Horizontal subscriptions carousel in the Discover feed.
///
/// Shows five fixed-width cards with a gradient label overlay.
/// Content is currently static — replace with real subscription data when ready.
class SubTile extends StatefulWidget {
  const SubTile({super.key});

  @override
  State<SubTile> createState() => _SubTileState();
}

class _SubTileState extends State<SubTile> {
  @override
  Widget build(BuildContext context) {
    return Padding(
        padding: const EdgeInsets.all(4.0),
        child: SizedBox(
          height: MediaQuery.of(context).size.height * 0.25,
          width: MediaQuery.of(context).size.width - 2,
          child: Column(
            //    crossAxisAlignment: CrossAxisAlignment.start,
            //    mainAxisAlignment: MainAxisAlignment.start,
            //   mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Subscriptions ',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
              ),
              //      const SizedBox(
              //         height: 5,
              //       ),
              SizedBox(
                height: MediaQuery.of(context).size.height * 0.20,
                width: double.infinity,
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: 5,
                  scrollDirection: Axis.horizontal,
                  itemBuilder: (BuildContext context, int index) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: Stack(
                        children: [
                          Container(
                            height: 200,
                            width: MediaQuery.of(context).size.width * 0.20,
                            decoration: BoxDecoration(
                              image: DecorationImage(
                                  fit: BoxFit.cover,
                                  image: Image.asset(
                                          'assets/images/breaking_news.jpg')
                                      .image
                                  //NetworkImage('')
                                  ),
                              borderRadius:
                                  const BorderRadius.all(Radius.circular(8.0)),
                              color: Colors.white,
                            ),
                          ),
                          Positioned(
                            bottom: 2,
                            child: Padding(
                              padding: const EdgeInsets.all(2.0),
                              child: Container(
                                  width:
                                      MediaQuery.of(context).size.width * 0.25,
                                  // height: 100,
                                  decoration: const BoxDecoration(
                                    gradient: LinearGradient(
                                        colors: [
                                          Colors.black,
                                          Colors.transparent
                                        ],
                                        begin: Alignment.bottomCenter,
                                        end: Alignment.topCenter,
                                        stops: [0.0, 1.0],
                                        tileMode: TileMode.clamp),
                                  ),
                                  child: const Padding(
                                    padding: EdgeInsets.all(2.0),
                                    child: Text(
                                      'sub text',
                                      style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600),
                                    ),
                                  )),
                            ),
                          )
                        ],
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ));
  }
}
