import {
  collection,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
} from '@react-native-firebase/firestore';

import { NewsSchema, type News } from '@/models/news';
import { SubscriptionSchema, type Subscription } from '@/models/subscription';
import { parseDoc, toMillis } from '@/services/firestore-utils';

const NEWS_COLLECTION = 'news';
const SUBSCRIPTIONS_COLLECTION = 'subscriptions';
const NEWS_LIMIT = 50;

/**
 * Contract for read-only Discover content managed from the Firebase console.
 * The concrete implementation is {@link FirebaseContentService}.
 */
export interface ContentService {
  /** Latest news articles, newest first. */
  getNews(): Promise<News[]>;

  /** Subscriptions in display order. */
  getSubscriptions(): Promise<Subscription[]>;
}

/** Firestore-backed implementation of {@link ContentService}. */
export class FirebaseContentService implements ContentService {
  private readonly db = getFirestore();

  async getNews(): Promise<News[]> {
    const snapshot = await getDocs(
      query(
        collection(this.db, NEWS_COLLECTION),
        orderBy('publishedAt', 'desc'),
        limit(NEWS_LIMIT),
      ),
    );
    return snapshot.docs.flatMap((newsDoc) => {
      const data = newsDoc.data();
      const fields = parseDoc(NewsSchema, newsDoc.ref.path, data);
      return fields ? [{ ...fields, id: newsDoc.id, publishedAt: toMillis(data.publishedAt) }] : [];
    });
  }

  async getSubscriptions(): Promise<Subscription[]> {
    const snapshot = await getDocs(
      query(collection(this.db, SUBSCRIPTIONS_COLLECTION), orderBy('order', 'asc')),
    );
    return snapshot.docs.flatMap((subscriptionDoc) => {
      const fields = parseDoc(SubscriptionSchema, subscriptionDoc.ref.path, subscriptionDoc.data());
      return fields ? [{ ...fields, id: subscriptionDoc.id }] : [];
    });
  }
}
