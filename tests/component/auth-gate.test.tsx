import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AuthGate } from '@/components/auth/AuthGate';

describe('AuthGate component', () => {
  it('renders default title, description, and action links', () => {
    render(<AuthGate />);

    expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    expect(screen.getByText(/Log in to access your personal card collection/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/register');
  });

  it('renders custom title, description, and features when provided', () => {
    render(
      <AuthGate
        title="Custom Title"
        description="Custom Description"
        features={['Feature 1', 'Feature 2']}
      />
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Description')).toBeInTheDocument();
    expect(screen.getByText('Feature 1')).toBeInTheDocument();
    expect(screen.getByText('Feature 2')).toBeInTheDocument();
  });
});

