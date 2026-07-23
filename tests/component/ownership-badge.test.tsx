import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OwnershipBadge } from '@/components/deck/OwnershipBadge';

describe('OwnershipBadge Component', () => {
  it('renders owned badge with check icon and green styling', () => {
    render(<OwnershipBadge status="owned" />);
    const badge = screen.getByTestId('ownership-badge-owned');
    expect(badge).toBeInTheDocument();
    expect(screen.getByText('Owned')).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-status', 'owned');
  });

  it('renders wishlist badge with cart icon, price, and blue styling', () => {
    render(<OwnershipBadge status="wishlist" price={3.50} />);
    const badge = screen.getByTestId('ownership-badge-wishlist');
    expect(badge).toBeInTheDocument();
    expect(screen.getByText('Wishlist')).toBeInTheDocument();
    expect(screen.getByText('$3.50')).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-status', 'wishlist');
  });

  it('renders proxy badge with printer icon and purple styling', () => {
    render(<OwnershipBadge status="proxy" />);
    const badge = screen.getByTestId('ownership-badge-proxy');
    expect(badge).toBeInTheDocument();
    expect(screen.getByText('Proxy')).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-status', 'proxy');
  });
});
