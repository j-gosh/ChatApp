import { createContext, useContext, type ReactNode } from 'react';

import { FirebaseAuthService, type AuthService } from '@/services/auth-service';
import { FirebaseChatService, type ChatService } from '@/services/chat-service';
import { FirebaseContentService, type ContentService } from '@/services/content-service';
import { connectToFirebaseEmulators } from '@/services/emulators';
import { FirebaseLocationService, type LocationService } from '@/services/location-service';
import { FirebaseMediaService, type MediaService } from '@/services/media-service';
import { FirebaseMemoryService, type MemoryService } from '@/services/memory-service';
import { FirebaseSnapService, type SnapService } from '@/services/snap-service';
import { FirebaseStoryService, type StoryService } from '@/services/story-service';
import { FirestoreUserService, type UserService } from '@/services/user-service';
import { FirebaseVideoService, type VideoService } from '@/services/video-service';

/** The app's service layer, injected through context so tests can swap in mocks. */
export interface Services {
  authService: AuthService;
  chatService: ChatService;
  contentService: ContentService;
  locationService: LocationService;
  mediaService: MediaService;
  memoryService: MemoryService;
  snapService: SnapService;
  storyService: StoryService;
  userService: UserService;
  videoService: VideoService;
}

export function createFirebaseServices(): Services {
  connectToFirebaseEmulators();
  const mediaService = new FirebaseMediaService();
  return {
    authService: new FirebaseAuthService(),
    chatService: new FirebaseChatService(),
    contentService: new FirebaseContentService(),
    locationService: new FirebaseLocationService(),
    mediaService,
    memoryService: new FirebaseMemoryService(mediaService),
    snapService: new FirebaseSnapService(mediaService),
    storyService: new FirebaseStoryService(mediaService),
    userService: new FirestoreUserService(),
    videoService: new FirebaseVideoService(),
  };
}

const ServicesContext = createContext<Services | null>(null);

export function ServicesProvider({
  services,
  children,
}: {
  services: Services;
  children: ReactNode;
}) {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export function useServices(): Services {
  const services = useContext(ServicesContext);
  if (!services) throw new Error('useServices must be used within a ServicesProvider');
  return services;
}
