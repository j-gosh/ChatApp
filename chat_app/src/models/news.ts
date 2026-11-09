import { z } from 'zod';

/** Fields of a Firestore `news/{id}` document, shown in the Discover page's "For you" section. */
export const NewsSchema = z.object({
  title: z.string(),
  thumbnailUrl: z.string(),
  summary: z.string().default(''),
  content: z.string().default(''),
  category: z.string(),
});

export type News = z.infer<typeof NewsSchema> & {
  id: string;
  /** Milliseconds since epoch. */
  publishedAt?: number;
};
