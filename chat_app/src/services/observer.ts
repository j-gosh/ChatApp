/** Stops a live subscription. */
export type Unsubscribe = () => void;

/** Receives values from a live subscription (the TS counterpart of a Dart `Stream` listener). */
export interface Observer<T> {
  next: (value: T) => void;
  error: (error: Error) => void;
}

export function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}
