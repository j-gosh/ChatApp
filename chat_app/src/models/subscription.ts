import { z } from 'zod';

/** Fields of a Firestore `subscriptions/{id}` document, shown in the Discover subscriptions row. */
export const SubscriptionSchema = z.object({
  label: z.string(),
  imageUrl: z.string(),
  order: z.number().default(0),
});

export type Subscription = z.infer<typeof SubscriptionSchema> & { id: string };
