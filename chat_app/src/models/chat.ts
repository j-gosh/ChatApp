export type ChatUserRole = 'admin' | 'agent' | 'moderator' | 'user';

export interface ChatUser {
  id: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  role?: ChatUserRole;
  /** Milliseconds since epoch. */
  createdAt?: number;
  /** Milliseconds since epoch. */
  updatedAt?: number;
  /** Milliseconds since epoch. */
  lastSeen?: number;
  metadata?: Record<string, unknown>;
}

export type RoomType = 'channel' | 'direct' | 'group';

export interface TextMessage {
  id: string;
  type: 'text';
  author: ChatUser;
  text: string;
  roomId?: string;
  createdAt?: number;
  updatedAt?: number;
}

/** Any message type other than text (image, file, custom…), which this app does not render. */
export interface UnsupportedMessage {
  id: string;
  type: 'unsupported';
  author: ChatUser;
  roomId?: string;
  createdAt?: number;
  updatedAt?: number;
}

export type ChatMessage = TextMessage | UnsupportedMessage;

export interface Room {
  id: string;
  type: RoomType;
  users: ChatUser[];
  name?: string;
  imageUrl?: string;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, unknown>;
}

/** A text message that has not been sent yet. */
export interface PartialText {
  text: string;
}

export function getUserDisplayName(user: Pick<ChatUser, 'firstName' | 'lastName'>): string {
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
}
