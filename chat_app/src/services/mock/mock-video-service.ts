import type { VideoService } from '@/services/video-service';

/** {@link VideoService} for mock data: there is no Cloud Function to sign a Stream token. */
export class MockVideoService implements VideoService {
  async getUserToken(): Promise<string> {
    throw new Error("Video calls aren't available with mock data.");
  }
}
