import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/feedback/EmptyState';

describe('EmptyState Component', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No cards found" description="Try adjusting your filters." />);
    
    expect(screen.getByText('No cards found')).toBeDefined();
    expect(screen.getByText('Try adjusting your filters.')).toBeDefined();
  });
});
