import 'package:chat_app/core/providers/chat/chat_providers.dart';
import 'package:chat_app/core/providers/service/service_providers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

/// Lists all users registered in the chat system (via FirebaseChatCore).
///
/// Tapping a user creates a chat room, adds them to the current user's friends
/// list, sets [selectedRoomProvider], and navigates to `/messages`.
class ActiveUsers extends ConsumerStatefulWidget {
  const ActiveUsers({super.key});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() {
    return _ActiveUsersState();
  }
}

class _ActiveUsersState extends ConsumerState<ActiveUsers> {
  @override
  Widget build(BuildContext context) {
    final availableUsers = ref.watch(availableUsersProvider);
    final auth = ref.watch(authServiceProvider);
    final chatService = ref.watch(chatServiceProvider);
    final userService = ref.watch(userServiceProvider);
    return availableUsers.when(
      data: (data) {
        return SizedBox(
          height: MediaQuery.of(context).size.height * 0.60,
          width: MediaQuery.of(context).size.width - 10,
          child: ListView.builder(
            itemCount: data.length,
            itemBuilder: (context, index) {
              final user = data[index];
              return Card(
                child: ListTile(
                  leading: Text('${user.firstName} ${user.lastName}'),
                  onTap: () {
                    ref
                        .read(selectedRoomProvider.notifier)
                        .select(
                          Room(
                            imageUrl: user.imageUrl,
                            lastMessages: const [],
                            createdAt: DateTime.now().millisecondsSinceEpoch,
                            updatedAt: DateTime.now().millisecondsSinceEpoch,
                            metadata: user.metadata,
                            name: '${user.firstName} ${user.lastName}',
                            id: user.id,
                            type: RoomType.direct,
                            users: [
                              User(id: auth.currentUser!.uid),
                              User(id: user.id),
                            ],
                          ),
                        );
                    chatService.createRoom(
                      User(
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        imageUrl: user.imageUrl,
                        lastSeen: user.lastSeen,
                        createdAt: DateTime.now().millisecondsSinceEpoch,
                        updatedAt: DateTime.now().millisecondsSinceEpoch,
                        role: Role.user,
                        metadata: user.metadata,
                      ),
                    );

                    userService.addUserToFriendsList(
                      auth.currentUser!.uid,
                      user,
                    );

                    context.push('/messages');
                  },
                ),
              );
            },
          ),
        );
      },
      error: (error, stackTrace) {
        return const Text('active user error');
      },
      loading: () {
        return const SizedBox(
          height: 150,
          width: 150,
          child: Center(child: CircularProgressIndicator.adaptive()),
        );
      },
    );
  }
}
