import 'package:chat_app/core/providers/ui/ui_providers.dart';
import 'package:chat_app/view/chats/friends/view.dart';
import 'package:chat_app/view/chats/messages/message_threads_list.dart';
import 'package:chat_app/view/profile/widgets/avatar.dart';
import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

/// Top-level chat tab rendered at index 0 of the bottom nav.
///
/// Shows two sub-views toggled by [chatPageIndexProvider]:
/// - 0: [MessageThreadsList] — existing conversations
/// - 1: [FriendsView] — friends list and active users for starting new chats
class ChatPage extends ConsumerStatefulWidget {
  const ChatPage({super.key});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() {
    return _ChatPageState();
  }
}

class _ChatPageState extends ConsumerState<ChatPage> {
  @override
  Widget build(BuildContext context) {
    final currentPage = ref.watch(chatPageIndexProvider);
    return Scaffold(
      appBar: AppBar(actions: const [ProfileAvatar()]),
      body: Column(
        children: [
          currentPage != 0
              ? Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    ElevatedButton(
                      onPressed: () {
                        ref.read(chatPageIndexProvider.notifier).setIndex(0);
                      },
                      child: const Text('Chats'),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        ref.read(friendsPageIndexProvider.notifier).setIndex(0);
                      },
                      child: const Text('Friends'),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        ref.read(friendsPageIndexProvider.notifier).setIndex(1);
                      },
                      child: const Text('Active Users'),
                    ),
                  ],
                )
              : Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    ElevatedButton(
                      onPressed: () async {
                        ref.read(chatPageIndexProvider.notifier).setIndex(0);
                      },
                      child: const Text('Chats'),
                    ),
                    ElevatedButton.icon(
                      onPressed: () {
                        ref.read(chatPageIndexProvider.notifier).setIndex(1);
                      },
                      label: const Text('New'),
                      icon: const Icon(Icons.add),
                    ),
                  ],
                ),
          SizedBox(
            height: MediaQuery.of(context).size.height * 0.70,
            width: MediaQuery.of(context).size.width - 20,
            child: currentPage == 0
                ? const MessageThreadsList()
                : const FriendsView(),
          ),
        ],
      ),
    );
  }
}


/**
 * 
                            String email = 'causing@email.com';
                            String password = 'Littlebill';
                            String firstName = 'Neil';
                            String lastName = 'Neilson';

                            UserCredential credential = await FirebaseAuth
                                .instance
                                .createUserWithEmailAndPassword(
                                    email: email, password: password);

                            final user = types.User(
                              id: credential.user!.uid,
                              createdAt: DateTime.now().millisecondsSinceEpoch,
                              updatedAt: DateTime.now().millisecondsSinceEpoch,
                              imageUrl: '',
                              metadata: {},
                              firstName: firstName,
                              lastName: lastName,
                              role: types.Role.user,
                              lastSeen: DateTime.now().millisecondsSinceEpoch,
                            );

                            FirebaseChatCore.instance
                                .createUserInFirestore(user);
 */