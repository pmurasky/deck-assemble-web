import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Navbar } from '@/components/layout/Navbar';

vi.mock('@auth0/nextjs-auth0/client', () => ({
  useUser: () => ({
    user: { name: 'Peter Hero', email: 'peter@marvel.com' },
    isLoading: false,
  }),
}));

vi.mock('@/lib/utils/permissions', () => ({
  isAdmin: () => true,
}));

describe('Navbar Mobile Component', () => {
  it('renders mobile menu button and opens mobile menu drawer on click', () => {
    render(<Navbar />);

    const openMenuButton = screen.getByRole('button', { name: /open mobile menu/i });
    expect(openMenuButton).toBeInTheDocument();

    // Drawer should initially not be in the document
    expect(screen.queryByText(/admin panel/i)).not.toBeInTheDocument();

    // Click open menu button
    fireEvent.click(openMenuButton);

    // Mobile menu drawer links should now be visible
    expect(screen.getByText(/admin panel/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close mobile menu/i })).toBeInTheDocument();

    // Click close menu button
    fireEvent.click(screen.getByRole('button', { name: /close mobile menu/i }));
    expect(screen.queryByText(/admin panel/i)).not.toBeInTheDocument();
  });
});
