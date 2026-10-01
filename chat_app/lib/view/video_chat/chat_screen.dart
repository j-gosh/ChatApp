import 'package:chat_app/core/providers/service/service_providers.dart';
import 'package:chat_app/core/providers/video/video_providers.dart';
import 'package:chat_app/core/services/video_service.dart';
import 'package:chat_app/models/user/user_model.dart';
import 'package:chat_app/utils/theme/app_theme.dart';
import 'package:chat_app/view/video_chat/call_container.dart';
import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:stream_video_flutter/stream_video_flutter.dart';

/// Video calling screen shown at nav index 2.
///
/// On first load checks camera and microphone permissions. Initializes the
/// Stream Video SDK using the current user's stored credentials, then shows
/// a "Make a video call" button that opens a friend-picker dialog.
class VideoChatScreen extends ConsumerStatefulWidget {
  const VideoChatScreen({super.key});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() {
    return _VideoChatScreenState();
  }
}

class _VideoChatScreenState extends ConsumerState<VideoChatScreen> {
  Call? _call;

  final bool _inCall = false;

  Future _showPermissionsDialog() {
    return showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Action Needed'),
          content: const Text(
            'In order to participate in video calls, you need to'
            ' give access to your camera and microphone while using the app.',
          ),
          actions: [
            OutlinedButton(onPressed: () {}, child: const Text('Cancel')),
            OutlinedButton(
              onPressed: () {
                openAppSettings();
              },
              child: const Text('Settings'),
            ),
          ],
        );
      },
    );
  }

  void _checkPermissions() async {
    var cameraStatus = await Permission.camera.status;
    var microphoneStatus = await Permission.microphone.status;

    if (cameraStatus.isGranted && microphoneStatus.isGranted) {
      return;
    } else {
      if (await Permission.camera.request().isGranted &&
          await Permission.microphone.request().isGranted) {
      } else {
        _showPermissionsDialog();
      }
    }
  }

  void _initStreamVideo(String userId, String userToken, String apiKey) {
    StreamVideo(
      apiKey,
      user: User.regular(userId: userId),
      userToken: userToken,
    );
  }

  Future showMakeCallDialog(
    List<UserProfile?> friends,
    String userVideoId,
  ) async {
    return showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Make a video call?'),
          content: SizedBox(
            height: 250,
            width: 250,
            child: Column(
              children: [
                const Text('Select a friend you want to video call'),
                ListView.builder(
                  itemCount: friends.length,
                  itemBuilder: (context, index) {
                    final friend = friends[index];
                    return ListTile(
                      leading: Text('${friend?.first} ${friend?.last}'),
                      onTap: () {},
                    );
                  },
                ),
              ],
            ),
          ),
          actions: [
            OutlinedButton(
              onPressed: () async {
                final call = StreamVideo.instance.makeCall(
                  callType: StreamCallType.defaultType(),
                  id: '',
                );
                await call.getOrCreate(
                  memberIds: [userVideoId],
                  notify: true,
                  video: true,
                );

                setState(() {
                  _call = call;
                });
              },
              child: const Text('Call'),
            ),
          ],
        );
      },
    );
  }

  @override
  void initState() {
    _checkPermissions();

    super.initState();
  }

  @override
  void deactivate() {
    super.deactivate();
  }

  @override
  Widget build(BuildContext context) {
    final userId = ref.watch(authServiceProvider).currentUserId;
    final friendsList = ref.watch(userFriendsListProvider(userId!));
    final videoCallCredentials = ref.watch(videoCredentialsProvider(userId));

    return videoCallCredentials.when(
      data: (data) {
        if (data.userInfo.id.isNotEmpty) {
          _initStreamVideo(data.userInfo.id, data.userToken.userId, apiKey);

          final friend = friendsList.whenData((value) {
            return value;
          }).value;

          return Scaffold(
            appBar: AppBar(title: const Text('')),
            body: SafeArea(child: CallContainer(call: _call!)),
            floatingActionButtonLocation:
                FloatingActionButtonLocation.centerFloat,
            floatingActionButton: _inCall == true
                ? SizedBox(
                    width: 240.0,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        FloatingActionButton(
                          tooltip: 'Camera',
                          onPressed: () {},
                          child: const Icon(Icons.switch_camera),
                        ),
                        FloatingActionButton(
                          onPressed: () {},
                          tooltip: 'Hangup',
                          backgroundColor: Colors.pink,
                          child: const Icon(Icons.call_end),
                        ),
                        FloatingActionButton(
                          tooltip: 'Mute Mic',
                          onPressed: () {},
                          child: const Icon(Icons.mic_off),
                        ),
                      ],
                    ),
                  )
                : GestureDetector(
                    child: Container(
                      margin: const EdgeInsets.all(5.0),
                      padding: const EdgeInsets.all(10.0),
                      height: 70,
                      width: MediaQuery.of(context).size.width - 15,
                      decoration: BoxDecoration(
                        color: AppTheme.appTheme.colorScheme.primary,
                        borderRadius: BorderRadius.circular(24.0),
                      ),
                      child: const Center(
                        child: Text(
                          ' Make a video call',
                          style: TextStyle(fontSize: 20.0),
                        ),
                      ),
                    ),
                    onTap: () {
                      showMakeCallDialog(friend!, data.userInfo.id);
                    },
                  ),
          );
        } else {
          return Scaffold(
            body: const Center(
              child: Text(
                'There does not seem to be credentials for '
                'you. Click the button below to make some.',
              ),
            ),
            floatingActionButtonLocation:
                FloatingActionButtonLocation.centerFloat,
            floatingActionButton: GestureDetector(
              child: Container(
                margin: const EdgeInsets.all(5.0),
                padding: const EdgeInsets.all(10.0),
                height: 70,
                width: MediaQuery.of(context).size.width - 15,
                decoration: BoxDecoration(
                  color: AppTheme.appTheme.colorScheme.primary,
                  borderRadius: BorderRadius.circular(24.0),
                ),
                child: const Center(
                  child: Text(
                    'Create Credentials',
                    style: TextStyle(fontSize: 20.0),
                  ),
                ),
              ),
              onTap: () {},
            ),
          );
        }
      },
      error: (error, stackTrace) {
        return const Text('error');
      },
      loading: () {
        return const Center(child: CircularProgressIndicator.adaptive());
      },
    );
  }
}

/**
 * 
 * GestureDetector(
              child: Container(
                margin: const EdgeInsets.all(5.0),
                padding: const EdgeInsets.all(10.0),
                height: 70,
                width: MediaQuery.of(context).size.width - 15,
                decoration: BoxDecoration(
                    color: AppTheme.appTheme.colorScheme.primary,
                    borderRadius: BorderRadius.circular(24.0)),
                child: const Center(
                  child: Text(
                    ' Make a video call',
                    style: TextStyle(fontSize: 20.0),
                  ),
                ),
              ),
              onTap: () {},
            ),
 */
