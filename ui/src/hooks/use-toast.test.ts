import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { reducer, toast, useToast } from './use-toast';

describe('reducer', () => {
  const toastA = { id: '1', open: true } as ReturnType<typeof reducer>['toasts'][number];
  const toastB = { id: '2', open: true } as ReturnType<typeof reducer>['toasts'][number];

  it('adds a toast, enforcing the single-toast limit', () => {
    const state = reducer({ toasts: [toastA] }, { type: 'ADD_TOAST', toast: toastB });
    expect(state.toasts).toEqual([toastB]);
  });

  it('updates a toast by id, leaving others untouched', () => {
    const state = reducer(
      { toasts: [toastA, toastB] },
      { type: 'UPDATE_TOAST', toast: { id: '1', title: 'updated' } },
    );
    expect(state.toasts).toEqual([{ ...toastA, title: 'updated' }, toastB]);
  });

  it('dismisses a specific toast by id', () => {
    const state = reducer({ toasts: [toastA, toastB] }, { type: 'DISMISS_TOAST', toastId: '1' });
    expect(state.toasts).toEqual([{ ...toastA, open: false }, toastB]);
  });

  it('dismisses every toast when no id is given', () => {
    const state = reducer({ toasts: [toastA, toastB] }, { type: 'DISMISS_TOAST' });
    expect(state.toasts.every((t) => t.open === false)).toBe(true);
  });

  it('removes a specific toast by id', () => {
    const state = reducer({ toasts: [toastA, toastB] }, { type: 'REMOVE_TOAST', toastId: '1' });
    expect(state.toasts).toEqual([toastB]);
  });

  it('removes every toast when no id is given', () => {
    const state = reducer({ toasts: [toastA, toastB] }, { type: 'REMOVE_TOAST' });
    expect(state.toasts).toEqual([]);
  });
});

describe('useToast', () => {
  // dismiss() schedules a real removal timeout far in the future; fake timers
  // keep that from leaking an open handle past the end of each test.
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds a toast created via toast() to every subscribed hook', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: 'Hello' });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Hello');
  });

  it('closes a toast when its onOpenChange fires with false', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: 'Hello' });
    });
    act(() => {
      result.current.toasts[0].onOpenChange?.(false);
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it('dismisses then removes a toast through the handle returned by useToast', () => {
    const { result } = renderHook(() => useToast());

    let handle!: ReturnType<typeof toast>;
    act(() => {
      handle = toast({ title: 'Hello' });
    });
    act(() => {
      result.current.dismiss(handle.id);
    });

    expect(result.current.toasts[0].open).toBe(false);

    // Dismissing the same toast again must not schedule a second removal.
    act(() => {
      result.current.dismiss(handle.id);
    });
    expect(result.current.toasts[0].open).toBe(false);

    // After the removal delay, the toast is dropped from state entirely.
    act(() => {
      vi.runAllTimers();
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it('applies a partial update through the handle returned by toast()', () => {
    const { result } = renderHook(() => useToast());

    let handle!: ReturnType<typeof toast>;
    act(() => {
      handle = toast({ title: 'Hello' });
    });
    act(() => {
      handle.update({ id: handle.id, title: 'Updated' });
    });

    expect(result.current.toasts[0].title).toBe('Updated');
  });
});
