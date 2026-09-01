import { renderHook } from '@testing-library/react';
import mousetrap from 'mousetrap';
import { afterEach, describe, expect, it, vi } from 'vitest';
import useMousetrap from './use-mousetrap';

vi.mock('mousetrap', () => ({
  default: {
    bind: vi.fn(),
    unbind: vi.fn(),
  },
}));

const mockedMousetrap = vi.mocked(mousetrap);

describe('useMousetrap', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('binds the key combo on mount', () => {
    const callback = vi.fn();
    renderHook(() => useMousetrap('g h', callback));

    expect(mockedMousetrap.bind).toHaveBeenCalledWith('g h', expect.any(Function), undefined);
  });

  it('forwards the event type when one is given', () => {
    const callback = vi.fn();
    renderHook(() => useMousetrap('g h', callback, 'keyup'));

    expect(mockedMousetrap.bind).toHaveBeenCalledWith('g h', expect.any(Function), 'keyup');
  });

  it('invokes the latest callback when the bound handler fires', () => {
    const callback = vi.fn();
    renderHook(() => useMousetrap('g h', callback));

    const boundHandler = mockedMousetrap.bind.mock.calls[0][1] as (evt: unknown, combo: string) => void;
    boundHandler({}, 'g h');

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('unbinds the key combo on unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useMousetrap('g h', callback));

    unmount();

    expect(mockedMousetrap.unbind).toHaveBeenCalledWith('g h', undefined);
  });

  it('rebinds when the key combo changes', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(({ key }) => useMousetrap(key, callback), {
      initialProps: { key: 'g h' },
    });

    rerender({ key: 'g m' });

    expect(mockedMousetrap.unbind).toHaveBeenCalledWith('g h', undefined);
    expect(mockedMousetrap.bind).toHaveBeenCalledWith('g m', expect.any(Function), undefined);
  });
});
