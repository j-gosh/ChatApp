import type { ChatUser } from '@/models/chat';
import { UserProfileSchema, type UserProfile } from '@/models/user-profile';
import { mockData } from '@/mock-data';
import { mapChatUser } from '@/services/chat-service';
import { docs, emit } from '@/services/mock/mock-utils';
import type { Observer, Unsubscribe } from '@/services/observer';
import type { UserService } from '@/services/user-service';

function getChatUser(userId: string): ChatUser | null {
  const data = mockData.users[userId];
  return data ? mapChatUser(userId, data) : null;
}

/** Read-only {@link UserService} backed by `src/mock-data`. Writes resolve without saving. */
export class MockUserService implements UserService {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const data = mockData.profileData[userId];
    return data ? UserProfileSchema.parse(data) : null;
  }

  async saveUserProfile(): Promise<void> {}

  async updateUserProfile(): Promise<void> {}

  subscribeFriends(userId: string, observer: Observer<ChatUser[]>): Unsubscribe {
    return emit(observer, () => {
      // Old Flutter docs use auto ids with the friend's id in an `id` field.
      const friends = new Map<string, ChatUser>();
      for (const [docId, data] of docs(mockData.userFriendsList[userId])) {
        const id = typeof data.id === 'string' ? data.id : docId;
        friends.set(id, mapChatUser(id, data));
      }
      return [...friends.values()];
    });
  }

  async addUserToFriendsList(): Promise<void> {}

  async getChatUser(userId: string): Promise<ChatUser | null> {
    return getChatUser(userId);
  }

  subscribeChatUser(userId: string, observer: Observer<ChatUser | null>): Unsubscribe {
    return emit(observer, () => getChatUser(userId));
  }

  async setAvatarUrl(): Promise<void> {}

  async setLocationSharing(): Promise<void> {}

  subscribeFollowing(userId: string, observer: Observer<string[]>): Unsubscribe {
    return emit(observer, () => docs(mockData.following[userId]).map(([id]) => id));
  }

  async countFollowing(userId: string): Promise<number> {
    return docs(mockData.following[userId]).length;
  }

  async follow(): Promise<void> {}

  async unfollow(): Promise<void> {}
}
