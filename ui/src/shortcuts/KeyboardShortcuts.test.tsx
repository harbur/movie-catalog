import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import useMousetrap from '../hooks/use-mousetrap';
import KeyboardShortcuts from './KeyboardShortcuts';

vi.mock('../hooks/use-mousetrap');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockedUseMousetrap = vi.mocked(useMousetrap);

describe('KeyboardShortcuts', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('binds "g h" to navigate home', () => {
    render(<KeyboardShortcuts />);

    const homeBinding = mockedUseMousetrap.mock.calls.find(([key]) => key === 'g h');
    expect(homeBinding).toBeDefined();

    homeBinding![1]();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('binds "g m" to navigate to movies', () => {
    render(<KeyboardShortcuts />);

    const moviesBinding = mockedUseMousetrap.mock.calls.find(([key]) => key === 'g m');
    expect(moviesBinding).toBeDefined();

    moviesBinding![1]();
    expect(mockNavigate).toHaveBeenCalledWith('/movies');
  });
});
