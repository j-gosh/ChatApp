import { NewsSchema, type News } from '@/models/news';
import { SubscriptionSchema, type Subscription } from '@/models/subscription';
import { mockData } from '@/mock-data';
import type { ContentService } from '@/services/content-service';
import { parseDoc, toMillis } from '@/services/firestore-utils';
import { docs, newestFirst } from '@/services/mock/mock-utils';

// Matches the Firebase query limit.
const NEWS_LIMIT = 50;

/** {@link ContentService} backed by `src/mock-data`. */
export class MockContentService implements ContentService {
  async getNews(): Promise<News[]> {
    return docs(mockData.news)
      .sort(newestFirst('publishedAt'))
      .slice(0, NEWS_LIMIT)
      .flatMap(([id, data]) => {
        const fields = parseDoc(NewsSchema, `news/${id}`, data);
        return fields ? [{ ...fields, id, publishedAt: toMillis(data.publishedAt) }] : [];
      });
  }

  async getSubscriptions(): Promise<Subscription[]> {
    return docs(mockData.subscriptions)
      .flatMap(([id, data]) => {
        const fields = parseDoc(SubscriptionSchema, `subscriptions/${id}`, data);
        return fields ? [{ ...fields, id }] : [];
      })
      .sort((a, b) => a.order - b.order);
  }
}
