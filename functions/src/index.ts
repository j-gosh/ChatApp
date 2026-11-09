import { initializeApp } from 'firebase-admin/app';

initializeApp();

export { onFriendWritten, onLocationCreated, onStoryCreated } from './audience.js';
export {
  onMemoryDeleted,
  onSnapCreated,
  onSnapDeleted,
  onStoryDeleted,
  purgeExpiredSnaps,
} from './media.js';
export { getStreamUserToken } from './stream.js';
