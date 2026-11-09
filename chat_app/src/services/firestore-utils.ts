import { Timestamp, type DocumentData } from '@react-native-firebase/firestore';
import type { z } from 'zod';

/** Converts a Firestore timestamp (or epoch millis) to epoch millis. */
export function toMillis(value: unknown): number | undefined {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === 'number') return value;
  return undefined;
}

export function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function optionalRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

/**
 * Parses a document's data with `schema`. Malformed documents are logged and
 * skipped, so one bad document doesn't break a whole list.
 */
export function parseDoc<T>(
  schema: z.ZodType<T>,
  path: string,
  data: DocumentData | undefined,
): T | undefined {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  console.warn(`[firestore] Skipping malformed document ${path}`, result.error);
  return undefined;
}

/** Splits `items` into chunks of at most `size` (e.g. for Firestore `in` queries). */
export function chunk<T>(items: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let start = 0; start < items.length; start += size) {
    chunks.push(items.slice(start, start + size));
  }
  return chunks;
}
