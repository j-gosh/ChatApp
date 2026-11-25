import type { MockCollection, MockDoc } from '@/mock-data';
import { toMillis } from '@/services/firestore-utils';
import { toError, type Observer, type Unsubscribe } from '@/services/observer';

/**
 * Delivers `read()` to `observer` on the next tick, like a Firestore listener's
 * first snapshot. Mock data is read-only, so nothing is delivered after that.
 */
export function emit<T>(observer: Observer<T>, read: () => T): Unsubscribe {
  const timer = setTimeout(() => {
    let value: T;
    try {
      value = read();
    } catch (error) {
      observer.error(toError(error));
      return;
    }
    observer.next(value);
  }, 0);
  return () => clearTimeout(timer);
}

/** The documents of `collection` as `[id, fields]` pairs. */
export function docs(collection: MockCollection | undefined): [string, MockDoc][] {
  return Object.entries(collection ?? {});
}

/** Sorts `[id, fields]` pairs newest first by the timestamp `field`. */
export function newestFirst(field: string) {
  return ([, a]: [string, MockDoc], [, b]: [string, MockDoc]) =>
    (toMillis(b[field]) ?? 0) - (toMillis(a[field]) ?? 0);
}

/** Whether the array field `field` contains `value` (Firestore `array-contains`). */
export function arrayContains(data: MockDoc, field: string, value: string): boolean {
  const array = data[field];
  return Array.isArray(array) && array.includes(value);
}

/** An error with a Firebase-style `code`, so `src/utils/errors.ts` maps it to a message. */
export function firebaseError(code: string, message: string): Error {
  return Object.assign(new Error(`[${code}] ${message}`), { code });
}
