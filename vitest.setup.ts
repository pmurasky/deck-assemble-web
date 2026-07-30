import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

vi.mock('@auth0/nextjs-auth0/client', () => ({
  useUser: () => ({
    user: { name: 'Test User', email: 'test@example.com' },
    isLoading: false,
    error: undefined,
  }),
}));

afterEach(() => {
  cleanup();
});

