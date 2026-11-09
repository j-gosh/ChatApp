import { z } from 'zod';

import { GroupSchema } from '@/models/group';

export const LOCATION_SHARING_MODES = ['off', 'whileUsing', 'always'] as const;

/** Whether, and when, the user shares their location with friends. */
export type LocationSharingMode = (typeof LOCATION_SHARING_MODES)[number];

/** Firestore profile document stored at `profileData/{uid}`. */
export const UserProfileSchema = z.object({
  userName: z.string(),
  first: z.string(),
  last: z.string(),
  groups: z.array(GroupSchema).default([]),
  /** Snaps sent plus received. Maintained by Cloud Functions. */
  snapCount: z.number().default(0),
  locationSharing: z.enum(LOCATION_SHARING_MODES).default('off'),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
