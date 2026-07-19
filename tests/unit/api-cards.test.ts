import { describe, it, expect } from 'vitest';
import { GET as getCards } from '@/app/api/v1/cards/route';
import { GET as getCardById } from '@/app/api/v1/cards/[cardId]/route';
import { NextRequest } from 'next/server';

describe('API Route: /api/v1/cards', () => {
  it('should return a paginated list of cards', async () => {
    const req = new NextRequest('http://localhost/api/v1/cards?page=1&limit=5');
    const res = await getCards(req);
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data.data.cards.length).toBeLessThanOrEqual(5);
    expect(data.data.total).toBeGreaterThan(0);
  });

  it('should filter cards by search query', async () => {
    const req = new NextRequest('http://localhost/api/v1/cards?q=Spider');
    const res = await getCards(req);
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data.data.cards.some((c: any) => c.name.includes('Spider-Man'))).toBe(true);
  });
});

describe('API Route: /api/v1/cards/[cardId]', () => {
  it('should return a specific card by ID', async () => {
    const req = new NextRequest('http://localhost/api/v1/cards/spidey-hero');
    const res = await getCardById(req, { params: Promise.resolve({ cardId: 'spidey-hero' }) });
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data.data.id).toBe('spidey-hero');
  });

  it('should return 404 for non-existent card', async () => {
    const req = new NextRequest('http://localhost/api/v1/cards/unknown-card');
    const res = await getCardById(req, { params: Promise.resolve({ cardId: 'unknown-card' }) });
    expect(res.status).toBe(404);
  });
});
