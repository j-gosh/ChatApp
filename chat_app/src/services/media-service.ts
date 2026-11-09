import {
  deleteObject,
  getDownloadURL,
  getStorage,
  putFile,
  ref,
} from '@react-native-firebase/storage';

export interface UploadedFile {
  /** Path of the object in the Storage bucket. */
  storagePath: string;
  /** Download URL for displaying the file. */
  url: string;
}

/**
 * Contract for photo uploads to Cloud Storage. The concrete implementation is
 * {@link FirebaseMediaService}.
 */
export interface MediaService {
  /** Uploads the JPEG at `localUri` (a `file://` URI) to `storagePath`. */
  uploadImage(localUri: string, storagePath: string): Promise<UploadedFile>;

  /** Download URL for an existing object. */
  getDownloadUrl(storagePath: string): Promise<string>;

  /** Deletes an object by its Storage path or download URL. */
  deleteFile(pathOrUrl: string): Promise<void>;
}

/** Cloud Storage-backed implementation of {@link MediaService}. */
export class FirebaseMediaService implements MediaService {
  private readonly storage = getStorage();

  async uploadImage(localUri: string, storagePath: string): Promise<UploadedFile> {
    const fileRef = ref(this.storage, storagePath);
    await putFile(fileRef, localUri, { contentType: 'image/jpeg' });
    return { storagePath, url: await getDownloadURL(fileRef) };
  }

  getDownloadUrl(storagePath: string): Promise<string> {
    return getDownloadURL(ref(this.storage, storagePath));
  }

  deleteFile(pathOrUrl: string): Promise<void> {
    return deleteObject(ref(this.storage, pathOrUrl));
  }
}

/** Deletes an uploaded file after a failed write, logging rather than masking the original error. */
export function discardUpload(mediaService: MediaService, storagePath: string): void {
  mediaService.deleteFile(storagePath).catch((error: unknown) => {
    console.warn('[storage] Could not delete orphaned upload', storagePath, error);
  });
}
