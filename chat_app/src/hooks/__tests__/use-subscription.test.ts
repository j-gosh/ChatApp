import { act, renderHook } from '@testing-library/react-native';

import { useSubscription, type Subscribe } from '@/hooks/use-subscription';
import type { Observer } from '@/services/observer';

function controllable<T>() {
  let observer: Observer<T> | undefined;
  const unsubscribe = jest.fn();
  const subscribe: Subscribe<T> = jest.fn((next) => {
    observer = next;
    return unsubscribe;
  });
  return {
    subscribe,
    unsubscribe,
    emit: (value: T) => observer?.next(value),
    fail: (error: Error) => observer?.error(error),
  };
}

describe('useSubscription', () => {
  beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));

  it('is loading until the first value arrives', async () => {
    const source = controllable<number>();
    const { result } = await renderHook(() => useSubscription(source.subscribe));
    expect(result.current).toEqual({ data: undefined, error: undefined, isLoading: true });

    await act(() => source.emit(1));
    expect(result.current).toEqual({ data: 1, error: undefined, isLoading: false });
  });

  it('exposes errors and keeps the last value', async () => {
    const source = controllable<number>();
    const { result } = await renderHook(() => useSubscription(source.subscribe));
    await act(() => source.emit(1));
    await act(() => source.fail(new Error('offline')));
    expect(result.current).toMatchObject({
      data: 1,
      error: new Error('offline'),
      isLoading: false,
    });
  });

  it('is idle when there is nothing to subscribe to', async () => {
    const { result } = await renderHook(() => useSubscription<number>(null));
    expect(result.current).toEqual({ data: undefined, error: undefined, isLoading: false });
  });

  it('unsubscribes on unmount', async () => {
    const source = controllable<number>();
    const { unmount } = await renderHook(() => useSubscription(source.subscribe));
    await unmount();
    expect(source.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('resubscribes and resets to loading when the source changes', async () => {
    const first = controllable<number>();
    const second = controllable<number>();
    const { result, rerender } = await renderHook(
      ({ source }: { source: Subscribe<number> }) => useSubscription(source),
      {
        initialProps: { source: first.subscribe },
      },
    );
    await act(() => first.emit(1));

    await rerender({ source: second.subscribe });
    expect(first.unsubscribe).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(true);
    await act(() => second.emit(2));
    expect(result.current.data).toBe(2);
  });
});
