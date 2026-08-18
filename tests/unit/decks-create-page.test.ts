import { describe, it, expect, vi } from 'vitest';
import CreateDeckPage from '@/app/(dashboard)/decks/create/page';
import { redirect } from 'next/navigation';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('CreateDeckPage', () => {
  it('redirects to /decks?create=true', () => {
    CreateDeckPage();
    expect(redirect).toHaveBeenCalledWith('/decks?create=true');
  });
});
