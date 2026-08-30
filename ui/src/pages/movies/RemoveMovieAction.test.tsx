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

  it('keeps the dialog open and does not report success when the API call fails', async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error('movie is referenced elsewhere'));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseDeleteMovie.mockReturnValue({ mutateAsync, isPending: false } as any);
    const user = userEvent.setup();
    renderAction();

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('button', { name: 'Delete movie' }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    // The confirmation dialog is only dismissed on success.
    expect(screen.getByText(/Confirm deletion of movie/i)).toBeInTheDocument();
  });

  it('shows the pending state and disables the delete action while in flight', async () => {
    const mutateAsync = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseDeleteMovie.mockReturnValue({ mutateAsync, isPending: true } as any);
    const user = userEvent.setup();
    renderAction();

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('Please wait')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });
});
