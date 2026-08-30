import { TooltipProvider } from '@/components/ui/tooltip';
import { useDeleteMovie } from '@/stores/movies';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RemoveMovieAction from './RemoveMovieAction';

vi.mock('@/stores/movies', () => ({
  useDeleteMovie: vi.fn(),
}));

const mockedUseDeleteMovie = vi.mocked(useDeleteMovie);
const movie = { id: 7, name: 'Dune' };

function renderAction() {
  render(
    <TooltipProvider>
      <RemoveMovieAction movie={movie} />
    </TooltipProvider>,
  );
}

describe('RemoveMovieAction', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('does not delete until the confirmation dialog is confirmed', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseDeleteMovie.mockReturnValue({ mutateAsync, isPending: false } as any);
    const user = userEvent.setup();
    renderAction();

    expect(mutateAsync).not.toHaveBeenCalled();

    // Before the dialog opens, the trash icon trigger is the only button.
    await user.click(screen.getByRole('button'));
    expect(await screen.findByText(/Confirm deletion of movie/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete movie' }));
    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
  });

  it('reports the deletion id used by the hook', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseDeleteMovie.mockReturnValue({ mutateAsync, isPending: false } as any);
    renderAction();

    expect(mockedUseDeleteMovie).toHaveBeenCalledWith(movie.id);
  });
});
