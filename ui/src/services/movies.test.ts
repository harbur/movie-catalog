import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMovie, deleteMovie, getMovie, getMovies, updateMovie } from './movies';

function jsonResponse(
  body: unknown,
  init: { ok?: boolean; status?: number; statusText?: string } = {},
): Response {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: init.statusText ?? 'OK',
    json: async () => body,
  } as Response;
}

describe('movies service', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches the list and returns the parsed body', async () => {
    const movies = [{ id: 1, name: 'Interstellar' }];
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(movies));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getMovies()).resolves.toEqual(movies);
    expect(fetchMock).toHaveBeenCalledWith('/api/movies', { headers: {} });
  });

  it('sends only the fields the API accepts, with a JSON content type', async () => {
    const created = { id: 1, name: 'Dune' };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(created, { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(createMovie({ id: 99, name: 'Dune' })).resolves.toEqual(created);

    const [uri, init] = fetchMock.mock.calls[0];
    expect(uri).toBe('/api/movies');
    expect(JSON.parse(init.body as string)).toEqual({ name: 'Dune' });
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
  });

  it('rejects with the API problem details on a non-ok response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        { title: 'Validation failed', errors: [{ message: 'name is required' }] },
        { ok: false, status: 422, statusText: 'Unprocessable Entity' },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(getMovies()).rejects.toThrow('Validation failed: name is required');
  });

  it('falls back to the status text when the error body is not JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => {
        throw new Error('not json');
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(getMovies()).rejects.toThrow('Internal Server Error (500)');
  });

  it('falls back to the response status text when the problem has no title', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ detail: 'movie not found' }, { ok: false, status: 404, statusText: 'Not Found' }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(getMovies()).rejects.toThrow('Not Found: movie not found');
  });

  it('falls back to the problem detail when there is no errors array', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        { title: 'Not Found', detail: 'movie not found' },
        { ok: false, status: 404, statusText: 'Not Found' },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(getMovies()).rejects.toThrow('Not Found: movie not found');
  });

  it('fetches a single movie by id', async () => {
    const movie = { id: 7, name: 'Dune' };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(movie));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getMovie(7)).resolves.toEqual(movie);
    expect(fetchMock).toHaveBeenCalledWith('/api/movies/7', { headers: {} });
  });

  it('updates a movie, sending only the fields the API accepts', async () => {
    const updated = { id: 7, name: 'Dune 2' };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(updated));
    vi.stubGlobal('fetch', fetchMock);

    await expect(updateMovie(7, { id: 7, name: 'Dune 2' })).resolves.toEqual(updated);

    const [uri, init] = fetchMock.mock.calls[0];
    expect(uri).toBe('/api/movies/7');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body as string)).toEqual({ name: 'Dune 2' });
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
  });

  it('deletes a movie without reading a response body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204, statusText: 'No Content' });
    vi.stubGlobal('fetch', fetchMock);

    await expect(deleteMovie(7)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith('/api/movies/7', { method: 'DELETE', headers: {} });
  });

  it('rejects when deleting fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ title: 'Not Found' }, { ok: false, status: 404, statusText: 'Not Found' }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(deleteMovie(7)).rejects.toThrow('Not Found');
  });
});
