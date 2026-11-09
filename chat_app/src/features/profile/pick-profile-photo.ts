import * as ImagePicker from 'expo-image-picker';

export type PhotoSource = 'camera' | 'library';

/** Thrown when the camera can't be opened because access was denied. */
export class CameraPermissionError extends Error {
  constructor(readonly canAskAgain: boolean) {
    super('Camera access is needed to take a profile photo.');
    this.name = 'CameraPermissionError';
  }
}

/**
 * Lets the user take or choose a square profile photo.
 * Resolves to the photo's local URI, or null if they cancelled.
 * @throws {CameraPermissionError} if camera access is denied.
 */
export async function pickProfilePhoto(source: PhotoSource): Promise<string | null> {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  };

  let result: ImagePicker.ImagePickerResult;
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) throw new CameraPermissionError(permission.canAskAgain);
    result = await ImagePicker.launchCameraAsync(options);
  } else {
    // The system photo picker doesn't need library permission.
    result = await ImagePicker.launchImageLibraryAsync(options);
  }

  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
}
