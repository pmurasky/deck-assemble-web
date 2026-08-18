import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LandGuidanceCallout } from '@/components/deck/LandGuidanceCallout';

describe('LandGuidanceCallout Component', () => {
  it('renders nothing when recommendedCount is null or undefined', () => {
    const { container, rerender } = render(<LandGuidanceCallout currentCount={36} recommendedCount={null} />);
    expect(container).toBeEmptyDOMElement();

    rerender(<LandGuidanceCallout currentCount={36} recommendedCount={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders "On Target" when current matches recommended count', () => {
    render(<LandGuidanceCallout currentCount={36} recommendedCount={36} />);
    expect(screen.getByText(/Land Guidance/i)).toBeInTheDocument();
    expect(screen.getByText(/On Target/i)).toBeInTheDocument();
    expect(screen.getAllByText('36')).toHaveLength(2);
  });

  it('renders recommended addition when under target', () => {
    render(<LandGuidanceCallout currentCount={32} recommendedCount={37} />);
    expect(screen.getByText(/\+5 Recommended/i)).toBeInTheDocument();
    expect(screen.getByText('32')).toBeInTheDocument();
    expect(screen.getByText('37')).toBeInTheDocument();
  });

  it('renders recommended reduction when over target', () => {
    render(<LandGuidanceCallout currentCount={40} recommendedCount={36} />);
    expect(screen.getByText(/-4 Recommended/i)).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('36')).toBeInTheDocument();
  });
});
