
import Movie from '@/models/movie';
import { QueryKeys } from '@/models/queryKeys';
import { CreateMovieForm } from '@/pages/movies/form';
import { createMovie, deleteMovie, getMovie, getMovies, updateMovie } from '@/services/movies';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Hook that triggers the query to retrieve Movies.
 */
export function useMovies() {
  const queryKey: QueryKeys = ['movies'];
  return useQuery<Movie[], Error>({ queryKey, queryFn: () => getMovies() });
}

/**
 * Hook that triggers the query to retrieve the Movie.
 */
export function useMovie(movieID: number) {
  const queryKey: QueryKeys = ['movies', { movieID }];
  return useQuery<Movie, Error>({ queryKey, queryFn: () => getMovie(movieID) });
}

/**
 * Hook that triggers the update of the Movie.
 */
export function useUpdateMovie(movieID: number) {
  const queryClient = useQueryClient();
  const mutationFn = async (movie: Movie) => {
    return updateMovie(movieID, movie);
  };

  return useMutation({
    mutationFn,
    onSettled: async () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['movies', { movieID }] });
    },
  });
}

/**
 * Hook that triggers the creation of a Movie.
 */
export function useCreateMovie() {
  const queryClient = useQueryClient();
  const mutationFn = async (values: CreateMovieForm) => await createMovie(values);
  return useMutation({
    mutationFn,
    onSettled: async () => queryClient.invalidateQueries({ queryKey: ['movies'] }),
  });
}

/**
 * Hook that triggers the deletion of a Movie.
 */
export function useDeleteMovie(movieID: number) {
  const queryClient = useQueryClient();
  const mutationFn = async () => deleteMovie(movieID);
  return useMutation({
    mutationFn,
    onSettled: async () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['movies', { movieID }] });
    }
  });
}