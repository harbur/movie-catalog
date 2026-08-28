import Movie from "@/models/movie";

/** The error body the API returns, as RFC 7807 problem details. */
interface ProblemDetails {
  title?: string;
  detail?: string;
  errors?: { message?: string }[];
}

/**
 * Performs a request against the API, failing loudly on a rejected response.
 *
 * Both halves matter. The API negotiates on content type and answers anything
 * it does not recognise with 415, so a body has to declare itself as JSON. And
 * without the status check a caller cannot tell a refused write from a stored
 * one, which leaves the UI reporting success for changes that never happened.
 */
async function request(uri: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(uri, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await errorMessage(response));
  }

  return response;
}

/** Renders the API's problem details into a message fit for a toast. */
async function errorMessage(response: Response): Promise<string> {
  try {
    const problem: ProblemDetails = await response.json();
    const details = problem.errors?.map((e) => e.message).filter(Boolean).join(', ');
    return [problem.title ?? response.statusText, details || problem.detail]
      .filter(Boolean)
      .join(': ');
  } catch {
    return `${response.statusText} (${response.status})`;
  }
}

/**
 * Narrows a movie to the fields the API accepts on a write. The id is carried
 * in the path, and the API rejects a body holding properties it does not know.
 */
function toMovieInput(movie: Movie) {
  return { name: movie.name };
}

export async function getMovie(id: number): Promise<Movie> {
  const res = await request(`/api/movies/${id}`);
  return await res.json();
}

export async function getMovies(): Promise<Movie[]> {
  const res = await request('/api/movies');
  return await res.json();
}

export async function createMovie(movie: Movie): Promise<Movie> {
  const res = await request('/api/movies', {
    method: 'POST',
    body: JSON.stringify(toMovieInput(movie)),
  });
  return await res.json();
}

export async function updateMovie(id: number, movie: Movie): Promise<Movie> {
  const res = await request(`/api/movies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toMovieInput(movie)),
  });
  return await res.json();
}

export async function deleteMovie(id: number): Promise<void> {
  // The API answers 204, so there is no body to read.
  await request(`/api/movies/${id}`, { method: 'DELETE' });
}
