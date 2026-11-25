import type { IMessage } from 'react-native-gifted-chat';

import { getUserDisplayName, type ChatMessage } from '@/models/chat';

/** Adapts a chat message to the shape `react-native-gifted-chat` renders. */
export function toGiftedMessage(message: ChatMessage): IMessage {
  return {
    _id: message.id,
    text: message.type === 'text' ? message.text : 'Unsupported message',
    createdAt: message.createdAt ?? Date.now(),
    user: {
      _id: message.author.id,
      name: getUserDisplayName(message.author) || undefined,
      avatar: message.author.imageUrl,
    },
  };
}
