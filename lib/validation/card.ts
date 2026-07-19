import { z } from 'zod';

export const cardSchema = z.object({
  id: z.string().min(1),
  oracleId: z.string().min(1),
  name: z.string().min(1),
  imageUrl: z.string().url().optional(),
  manaCost: z.string().optional(),
  manaValue: z.number().min(0),
  colors: z.array(z.string()),
  colorIdentity: z.array(z.string()),
  typeLine: z.string().min(1),
  oracleText: z.string().optional(),
  power: z.string().optional(),
  toughness: z.string().optional(),
  loyalty: z.string().optional(),
  setCode: z.string().min(1),
  setName: z.string().min(1),
  rarity: z.string().min(1),
  legalities: z.record(z.string(), z.string()),
});

export const createDeckSchema = z.object({
  name: z.string().trim().min(1, 'Deck name is required').max(100, 'Deck name is too long'),
  format: z.string().min(1, 'Format is required'),
  commanderCardId: z.string().optional(),
  description: z.string().max(500).optional(),
});
