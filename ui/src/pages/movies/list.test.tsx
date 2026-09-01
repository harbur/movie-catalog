import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as moviesStore from '@/stores/movies';
import { List } from './list';

vi.mock('@/stores/movies', async (importOriginal) => ({
  ...(await importOriginal<typeof moviesStore>()),
  useMovies: vi.fn(),
}));

const mockedUseMovies = vi.mocked(moviesStore.useMovies);

function renderList() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <List />
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function queryResult(overrides: Record<string, unknown>): any {
  return { data: undefined, isLoading: false, error: null, ...overrides };
}

describe('List', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading skeleton while movies are being fetched', () => {
    mockedUseMovies.mockReturnValue(queryResult({ isLoading: true }));
    renderList();

    expect(screen.getByRole('columnheader', { name: 'ID' })).toBeInTheDocument();
    expect(screen.queryByText('No results.')).not.toBeInTheDocument();
  });

  it('shows an empty table when the fetch fails', () => {
    mockedUseMovies.mockReturnValue(queryResult({ error: new Error('boom') }));
    renderList();

    expect(screen.getByText('No results.')).toBeInTheDocument();
  });

  it('shows an empty table when there is no data yet', () => {
    mockedUseMovies.mockReturnValue(queryResult({ data: undefined }));
    renderList();

    expect(screen.getByText('No results.')).toBeInTheDocument();
  });

  it('renders a row with the id and name of each movie', () => {
    mockedUseMovies.mockReturnValue(
      queryResult({ data: [{ id: 1, name: 'Interstellar' }, { id: 2, name: 'Dune' }] }),
    );
    renderList();

    expect(screen.getByText('Interstellar')).toBeInTheDocument();
    expect(screen.getByText('Dune')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders the row actions for each movie', () => {
    mockedUseMovies.mockReturnValue(queryResult({ data: [{ id: 1, name: 'Interstellar' }] }));
    renderList();

    const row = screen.getByText('Interstellar').closest('tr')!;
    expect(within(row).getAllByRole('button')).toHaveLength(2);
  });

  it('opens the create dialog from the toolbar button', async () => {
    mockedUseMovies.mockReturnValue(queryResult({ data: [] }));
    const user = userEvent.setup();
    renderList();

    await user.click(screen.getByRole('button', { name: 'Create movie' }));

    expect(await screen.findByRole('heading', { name: 'Create movie' })).toBeInTheDocument();
  });
});
