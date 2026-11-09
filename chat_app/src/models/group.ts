import { z } from 'zod';

import { MemberSchema } from '@/models/member';

/** A chat group with a creator and a list of members, embedded in a user profile. */
export const GroupSchema = z.object({
  createdBy: z.string(),
  groupId: z.string(),
  members: z.array(MemberSchema),
});

export type Group = z.infer<typeof GroupSchema>;
