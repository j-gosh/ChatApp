import { z } from 'zod';

/** Fields of a Firestore `snaps/{batchId}_{recipientId}` document: a photo that disappears once opened. */
export const SnapSchema = z.object({
  batchId: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  recipientId: z.string(),
  storagePath: z.string(),
});

export type Snap = z.infer<typeof SnapSchema> & {
  id: string;
  /** Milliseconds since epoch. */
  createdAt?: number;
};
