import { z } from 'zod';

/** A single member inside a group. */
export const MemberSchema = z.object({
  userName: z.string(),
  first: z.string(),
  last: z.string(),
});

export type Member = z.infer<typeof MemberSchema>;
