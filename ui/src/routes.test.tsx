import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { router } from './routes';

function renderApp() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe('router', () => {
  afterEach(async () => {
    await router.navigate('/');
  });

  it('renders the home page at /', async () => {
    renderApp();

    expect(await screen.findByText('Home Page')).toBeInTheDocument();
  });

  it('renders the side menu navigation on every route', async () => {
    renderApp();

    expect(await screen.findByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /movies/i })).toHaveAttribute('href', '/movies');
  });

  it('renders the create movie page at /movies/new', async () => {
    await router.navigate('/movies/new');
    renderApp();

    // Create() renders no content of its own; the layout around it is proof
    // the route resolved rather than falling through to a 404.
    expect(await screen.findByRole('link', { name: /movies/i })).toBeInTheDocument();
  });

  it('parses the :id param and renders the edit movie page', async () => {
    await router.navigate('/movies/42/edit');
    renderApp();

    expect(await screen.findByText('42')).toBeInTheDocument();
  });

  it('parses the :id param and renders the view movie page', async () => {
    await router.navigate('/movies/42');
    renderApp();

    expect(await screen.findByText('42')).toBeInTheDocument();
  });
});
