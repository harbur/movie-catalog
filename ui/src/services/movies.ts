import Movie from "@/models/movie";

export async function getMovie(id: number): Promise<Movie> {
  const res = await fetch(`/api/movies/${id}`);
  return await res.json();
}

export async function getMovies(): Promise<Movie[]> {
  const res = await fetch('/api/movies');
  return await res.json();
}

export async function createMovie(movie: Movie) {
  await fetch('/api/movies', {
    method: 'POST',
    body: JSON.stringify(movie),
  });
}

export async function updateMovie(id: number, movie: Movie) {
  const res = await fetch(`/api/movies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(movie)
  });
  return await res.json();
}

export async function deleteMovie(id: number) {
  console.log('about to trigger')
  await fetch(`/api/movies/${id}`, {
    method: 'DELETE',
  });
  console.log('triggered')
}