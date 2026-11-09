import { z } from 'zod';

/** Fields of a Firestore `memories/{uid}/items/{id}` document: a photo saved privately. */
export const MemorySchema = z.object({
  imageUrl: z.string(),
  storagePath: z.string(),
});

export type Memory = z.infer<typeof MemorySchema> & {
  id: string;
  /** Milliseconds since epoch. */
  createdAt?: number;
};
