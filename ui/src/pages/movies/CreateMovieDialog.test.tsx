import { Dialog } from '@/components/ui/dialog';
import { useCreateMovie } from '@/stores/movies';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CreateMovieDialog from './CreateMovieDialog';

vi.mock('@/stores/movies', () => ({
  useCreateMovie: vi.fn(),
}));

const mockedUseCreateMovie = vi.mocked(useCreateMovie);

function renderDialog() {
  const closeDialog = vi.fn();
  render(
    <Dialog open>
      <CreateMovieDialog open closeDialog={closeDialog} />
    </Dialog>,
  );
  return { closeDialog };
}

describe('CreateMovieDialog', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('rejects a name that is too short without submitting', async () => {
    const mutateAsync = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseCreateMovie.mockReturnValue({ mutateAsync, isPending: false } as any);
    const user = userEvent.setup();
    renderDialog();

    await user.type(screen.getByLabelText('Name'), 'A');
    await user.click(screen.getByRole('button', { name: 'Create movie' }));

    expect(await screen.findByText(/too small/i)).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('submits the form and closes the dialog on success', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: 1, name: 'Dune' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseCreateMovie.mockReturnValue({ mutateAsync, isPending: false } as any);
    const user = userEvent.setup();
    const { closeDialog } = renderDialog();

    await user.type(screen.getByLabelText('Name'), 'Dune');
    await user.click(screen.getByRole('button', { name: 'Create movie' }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ name: 'Dune' }));
    await waitFor(() => expect(closeDialog).toHaveBeenCalled());
  });

  it('keeps the dialog open and does not report success when the API call fails', async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error('name already exists'));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseCreateMovie.mockReturnValue({ mutateAsync, isPending: false } as any);
    const user = userEvent.setup();
    const { closeDialog } = renderDialog();

    await user.type(screen.getByLabelText('Name'), 'Dune');
    await user.click(screen.getByRole('button', { name: 'Create movie' }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    expect(closeDialog).not.toHaveBeenCalled();
  });
});
