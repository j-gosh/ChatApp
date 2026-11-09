import { useMemo } from 'react';

import type { StoryVisibility } from '@/models/story';
import { useSignedInUser } from '@/providers/AuthStateProvider';
import { useServices } from '@/providers/ServicesProvider';
import { discardUpload } from '@/services/media-service';

/**
 * Photo sharing business logic: stories, snaps, memories, and the profile photo.
 * Delegates to the services so screens stay free of Firebase code.
 */
export function useMediaController() {
  const signedInUser = useSignedInUser();
  const { authService, mediaService, memoryService, snapService, storyService, userService } =
    useServices();

  return useMemo(() => {
    // The auth service's user reflects profile changes made since sign-in (e.g. a new photo).
    const currentUser = () => authService.currentUser ?? signedInUser;

    return {
      postStory(localUri: string, caption: string, visibility: StoryVisibility): Promise<void> {
        const user = currentUser();
        return storyService.postStory({
          owner: {
            id: user.uid,
            name: user.displayName ?? '',
            imageUrl: user.photoURL ?? undefined,
          },
          localUri,
          caption: caption.trim(),
          visibility,
        });
      },

      setStoryVisibility(storyId: string, visibility: StoryVisibility): Promise<void> {
        return storyService.setVisibility(storyId, visibility);
      },

      deleteStory(storyId: string): Promise<void> {
        return storyService.deleteStory(storyId);
      },

      sendSnap(localUri: string, recipientIds: string[]): Promise<void> {
        const user = currentUser();
        return snapService.sendSnap({
          sender: { id: user.uid, name: user.displayName ?? '' },
          recipientIds,
          localUri,
        });
      },

      /** Marks a received snap as opened, which makes it disappear. */
      consumeSnap(snapId: string): Promise<void> {
        return snapService.consumeSnap(snapId);
      },

      saveMemory(localUri: string): Promise<void> {
        return memoryService.saveMemory(signedInUser.uid, localUri);
      },

      deleteMemory(memoryId: string): Promise<void> {
        return memoryService.deleteMemory(signedInUser.uid, memoryId);
      },

      /** Uploads a new profile photo and shows it everywhere the user's avatar appears. */
      async updateAvatar(localUri: string): Promise<void> {
        const user = currentUser();
        const previousUrl = user.photoURL;
        const { storagePath, url } = await mediaService.uploadImage(
          localUri,
          `avatars/${user.uid}/${Date.now()}.jpg`,
        );
        try {
          await userService.setAvatarUrl(user.uid, url);
        } catch (error) {
          discardUpload(mediaService, storagePath);
          throw error;
        }
        try {
          await authService.updatePhotoUrl(user, url);
        } catch (error) {
          // The avatar is already visible via the chat user document.
          console.error('[profile] Could not store photo URL on the auth account', error);
        }
        if (previousUrl) {
          mediaService.deleteFile(previousUrl).catch((error: unknown) => {
            console.warn('[profile] Could not delete previous profile photo', error);
          });
        }
      },
    };
  }, [
    authService,
    mediaService,
    memoryService,
    signedInUser,
    snapService,
    storyService,
    userService,
  ]);
}
