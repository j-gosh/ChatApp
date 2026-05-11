import 'package:chat_app/data/datasources/get_profile_pic.dart';
import 'package:chat_app/models/images/profile_picture.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Circular avatar widget shown in app-bar actions.
///
/// Loads the profile picture from `assets/json/profile_picture.json` and
/// navigates to `/profile` when tapped. Falls back to a text button while
/// loading or when no image is available.
class ProfileAvatar extends StatefulWidget {
  const ProfileAvatar({super.key});

  @override
  State<ProfileAvatar> createState() => _ProfileAvatarState();
}

class _ProfileAvatarState extends State<ProfileAvatar> {
  final GetProfilePic _getProfilePic = GetProfilePic();

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: _getProfilePic.loadProfilePicture(),
      builder: (context, snapshot) {
        if (snapshot.hasData &&
            snapshot.connectionState == ConnectionState.done) {
          ProfilePicture p = snapshot.data!.first;
          return GestureDetector(
            onTap: () {
              context.push('/profile');
            },
            child: CircleAvatar(
              backgroundImage:
                  //p.image != ''
                  //   ? NetworkImage(p.image)
                  //   :
                  Image.asset(p.image).image,
            ),
          );
        } else if (snapshot.data == null ||
            snapshot.connectionState == ConnectionState.none) {
          return TextButton(
            onPressed: () {
              context.push('/profile');
            },
            child: const Text('Profile'),
          );
        }

        return const CircularProgressIndicator();
      },
    );
  }
}
