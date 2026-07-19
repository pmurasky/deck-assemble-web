import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';

describe('LoadingSkeleton Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<LoadingSkeleton />);
    expect(container.firstChild).toBeDefined();
    expect(container.querySelector('.animate-pulse')).toBeDefined();
  });
});
