import type { Services } from '@/providers/ServicesProvider';
import { MockAuthService } from '@/services/mock/mock-auth-service';
import { MockChatService } from '@/services/mock/mock-chat-service';
import { MockContentService } from '@/services/mock/mock-content-service';
import { MockLocationService } from '@/services/mock/mock-location-service';
import { MockMediaService } from '@/services/mock/mock-media-service';
import { MockMemoryService } from '@/services/mock/mock-memory-service';
import { MockSnapService } from '@/services/mock/mock-snap-service';
import { MockStoryService } from '@/services/mock/mock-story-service';
import { MockUserService } from '@/services/mock/mock-user-service';
import { MockVideoService } from '@/services/mock/mock-video-service';

/**
 * Services that read the JSON fixtures in `src/mock-data` instead of Firebase.
 * Used in debug builds; see `isMockDataEnabled` in `src/config.ts`.
 */
export function createMockDataServices(): Services {
  console.warn('[mock] Using mock data from src/mock-data (read-only)');
  const authService = new MockAuthService();
  const mediaService = new MockMediaService();
  return {
    authService,
    chatService: new MockChatService(authService),
    contentService: new MockContentService(),
    locationService: new MockLocationService(),
    mediaService,
    memoryService: new MockMemoryService(),
    snapService: new MockSnapService(mediaService),
    storyService: new MockStoryService(),
    userService: new MockUserService(),
    videoService: new MockVideoService(),
  };
}
