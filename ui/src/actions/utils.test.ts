import { afterEach, describe, expect, it, vi } from 'vitest';
import utils from './utils';

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

describe('utils', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('get', () => {
    it('returns the response on a successful request', async () => {
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
      vi.stubGlobal('fetch', fetchMock);

      const response = await utils.get('/api/movies');

      expect(fetchMock).toHaveBeenCalledWith('/api/movies', {});
      expect(response.ok).toBe(true);
    });

    it('throws the parsed error body on a non-ok response', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse({ error: true, reason: 'Not Found', message: 'movie not found' }, { ok: false, status: 404 }),
      );
      vi.stubGlobal('fetch', fetchMock);

      await expect(utils.get('/api/movies/1')).rejects.toEqual({
        error: true,
        reason: 'Not Found',
        message: 'movie not found',
      });
    });
  });

  describe('post', () => {
    it('sends a JSON body with the right method and content type', async () => {
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 1 }, { status: 201 }));
      vi.stubGlobal('fetch', fetchMock);

      await utils.post('/api/movies', { name: 'Dune' });

      const [uri, init] = fetchMock.mock.calls[0];
      expect(uri).toBe('/api/movies');
      expect(init.method).toBe('POST');
      expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
      expect(JSON.parse(init.body)).toEqual({ name: 'Dune' });
    });

    it('throws the parsed error body on a non-ok response', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse({ error: true, reason: 'Bad Request', message: 'name is required' }, { ok: false, status: 400 }),
      );
      vi.stubGlobal('fetch', fetchMock);

      await expect(utils.post('/api/movies', {})).rejects.toEqual({
        error: true,
        reason: 'Bad Request',
        message: 'name is required',
      });
    });

    it('falls back to a synthesized error when the error body is not JSON', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('not json');
        },
      });
      vi.stubGlobal('fetch', fetchMock);

      await expect(utils.post('/api/movies', {})).rejects.toEqual({
        error: true,
        reason: 'Connection Error',
        message: 'Internal Server Error (500)',
      });
    });
  });

  describe('put', () => {
    it('sends a JSON body with the right method and content type', async () => {
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 1, name: 'Dune 2' }));
      vi.stubGlobal('fetch', fetchMock);

      await utils.put('/api/movies/1', { name: 'Dune 2' });

      const [uri, init] = fetchMock.mock.calls[0];
      expect(uri).toBe('/api/movies/1');
      expect(init.method).toBe('PUT');
      expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
      expect(JSON.parse(init.body)).toEqual({ name: 'Dune 2' });
    });

    it('throws the parsed error body on a non-ok response', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse({ error: true, reason: 'Conflict', message: 'invalid id' }, { ok: false, status: 409 }),
      );
      vi.stubGlobal('fetch', fetchMock);

      await expect(utils.put('/api/movies/1', {})).rejects.toEqual({
        error: true,
        reason: 'Conflict',
        message: 'invalid id',
      });
    });
  });

  describe('delete', () => {
    it('sends a DELETE request with the right content type and no body', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204, statusText: 'No Content' });
      vi.stubGlobal('fetch', fetchMock);

      const response = await utils.delete('/api/movies/1');

      expect(fetchMock).toHaveBeenCalledWith('/api/movies/1', {
        headers: { 'Content-Type': 'application/json' },
        method: 'DELETE',
      });
      expect(response.ok).toBe(true);
    });

    it('resolves even when the response is not ok, without reading a body', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' });
      vi.stubGlobal('fetch', fetchMock);

      await expect(utils.delete('/api/movies/1')).resolves.toMatchObject({ ok: false, status: 404 });
    });
  });
});
