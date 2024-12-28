import Movie from '@/models/movie';
import RemoveMovieAction from './RemoveMovieAction';
import UpdateMovieAction from './UpdateMovieAction';

export default function MovieActions({ movie }: { movie: Movie }) {
  return (
    <div className="flex mx-4">
      <div className="flex-1" />
      <UpdateMovieAction movie={movie} />
      <RemoveMovieAction movie={movie} />
    </div>
  );
}