import { z } from 'zod';

/** Fields of a Firestore `locations/{uid}` document: a friend's last shared location. */
export const FriendLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  displayName: z.string(),
  imageUrl: z.string().nullish(),
});

/** A friend's last shared location, shown as a marker on the map. */
export type MapFriend = z.infer<typeof FriendLocationSchema> & {
  id: string;
  /** Milliseconds since epoch. */
  updatedAt?: number;
};
