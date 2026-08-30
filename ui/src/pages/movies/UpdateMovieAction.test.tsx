import { TooltipProvider } from '@/components/ui/tooltip';
import { useUpdateMovie } from '@/stores/movies';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import UpdateMovieAction from './UpdateMovieAction';

vi.mock('@/stores/movies', () => ({
  useUpdateMovie: vi.fn(),
}));

const mockedUseUpdateMovie = vi.mocked(useUpdateMovie);
const movie = { id: 7, name: 'Dune' };

function renderAction() {
  render(
    <TooltipProvider>
      <UpdateMovieAction movie={movie} />
    </TooltipProvider>,
  );
}

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button'));
  expect(await screen.findByRole('heading', { name: 'Update movie' })).toBeInTheDocument();
}

describe('UpdateMovieAction', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('submits the edited name and closes the dialog on success', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: 7, name: 'Dune 2' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseUpdateMovie.mockReturnValue({ mutateAsync, isPending: false } as any);
    const user = userEvent.setup();
    renderAction();

    await openDialog(user);
    const input = screen.getByLabelText('Name');
    await user.clear(input);
    await user.type(input, 'Dune 2');
    await user.click(screen.getByRole('button', { name: 'Update movie' }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ id: 7, name: 'Dune 2' }));
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Update movie' })).not.toBeInTheDocument());
  });

  it('reports the movie id used by the hook', () => {
    const mutateAsync = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseUpdateMovie.mockReturnValue({ mutateAsync, isPending: false } as any);
    renderAction();

    expect(mockedUseUpdateMovie).toHaveBeenCalledWith(movie.id);
  });

  it('keeps the dialog open and does not report success when the API call fails', async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error('name already exists'));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseUpdateMovie.mockReturnValue({ mutateAsync, isPending: false } as any);
    const user = userEvent.setup();
    renderAction();

    await openDialog(user);
    await user.click(screen.getByRole('button', { name: 'Update movie' }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    expect(screen.getByRole('heading', { name: 'Update movie' })).toBeInTheDocument();
  });

  it('shows the pending state and disables cancel while in flight', async () => {
    const mutateAsync = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseUpdateMovie.mockReturnValue({ mutateAsync, isPending: true } as any);
    const user = userEvent.setup();
    renderAction();

    await openDialog(user);

    expect(screen.getByText('Please wait')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });
});
