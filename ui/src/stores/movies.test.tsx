import * as moviesService from '@/services/movies';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCreateMovie, useDeleteMovie, useMovie, useMovies, useUpdateMovie } from './movies';

vi.mock('@/services/movies');

function wrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('movies store', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('useMovies fetches the movie list', async () => {
    const movies = [{ id: 1, name: 'Interstellar' }];
    vi.mocked(moviesService.getMovies).mockResolvedValue(movies);

    const { result } = renderHook(() => useMovies(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(movies);
  });

  it('useMovie fetches a single movie by id', async () => {
    const movie = { id: 1, name: 'Interstellar' };
    vi.mocked(moviesService.getMovie).mockResolvedValue(movie);

    const { result } = renderHook(() => useMovie(1), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(moviesService.getMovie).toHaveBeenCalledWith(1);
    expect(result.current.data).toEqual(movie);
  });

  it('useCreateMovie delegates to the create service', async () => {
    const created = { id: 1, name: 'Dune' };
    vi.mocked(moviesService.createMovie).mockResolvedValue(created);

    const { result } = renderHook(() => useCreateMovie(), { wrapper: wrapper() });
    result.current.mutate({ name: 'Dune' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(moviesService.createMovie).toHaveBeenCalledWith({ name: 'Dune' });
  });

  it('useUpdateMovie delegates to the update service with the bound id', async () => {
    const updated = { id: 1, name: 'Dune 2' };
    vi.mocked(moviesService.updateMovie).mockResolvedValue(updated);

    const { result } = renderHook(() => useUpdateMovie(1), { wrapper: wrapper() });
    result.current.mutate({ name: 'Dune 2' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(moviesService.updateMovie).toHaveBeenCalledWith(1, { name: 'Dune 2' });
  });

  it('useDeleteMovie delegates to the delete service with the bound id', async () => {
    vi.mocked(moviesService.deleteMovie).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteMovie(1), { wrapper: wrapper() });
    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(moviesService.deleteMovie).toHaveBeenCalledWith(1);
  });

  it('surfaces a failed mutation to the caller', async () => {
    vi.mocked(moviesService.deleteMovie).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useDeleteMovie(1), { wrapper: wrapper() });
    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('boom');
  });
});
