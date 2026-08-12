import { auth0 } from '@/lib/auth0';
import type {
  DeckTag,
  CreateTagRequest,
  UpdateTagRequest,
  DeckFolder,
  CreateFolderRequest,
  UpdateFolderRequest,
  DeckCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryTemplate,
  CreateCategoryTemplateRequest,
  UpdateCategoryTemplateRequest,
} from '@/types/organization';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

async function fetchOrg(path: string, init?: RequestInit) {
  const token = await auth0.getAccessToken();
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token.token}`);
  headers.set('Content-Type', 'application/json');
  return fetch(new URL(`/api/v1${path}`, API_BASE_URL), { ...init, cache: 'no-store', headers });
}

async function json<T>(res: Promise<Response>, fallbackMessage: string): Promise<T> {
  const response = await res;
  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    const msg = errData?.error?.message || errData?.message || fallbackMessage;
    const err = new Error(msg) as Error & { status?: number };
    err.status = response.status;
    throw err;
  }
  return response.json() as Promise<T>;
}

// --- Deck Tags ---
export async function getDeckTags(): Promise<DeckTag[]> {
  return json(fetchOrg('/deck-tags'), 'Failed to fetch deck tags');
}

export async function createDeckTag(req: CreateTagRequest): Promise<DeckTag> {
  return json(fetchOrg('/deck-tags', { method: 'POST', body: JSON.stringify(req) }), 'Failed to create deck tag');
}

export async function updateDeckTag(tagId: number, req: UpdateTagRequest): Promise<DeckTag> {
  return json(fetchOrg(`/deck-tags/${tagId}`, { method: 'PATCH', body: JSON.stringify(req) }), 'Failed to update deck tag');
}

export async function deleteDeckTag(tagId: number): Promise<void> {
  const res = await fetchOrg(`/deck-tags/${tagId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete deck tag');
}

export async function assignDeckTags(deckId: number, tagIds: number[]): Promise<{ deckId: number; tagIds: number[] }> {
  return json(fetchOrg(`/decks/${deckId}/tags`, { method: 'PUT', body: JSON.stringify({ tagIds }) }), 'Failed to assign tags to deck');
}

// --- Deck Folders ---
export async function getDeckFolders(): Promise<DeckFolder[]> {
  return json(fetchOrg('/deck-folders'), 'Failed to fetch deck folders');
}

export async function createDeckFolder(req: CreateFolderRequest): Promise<DeckFolder> {
  return json(fetchOrg('/deck-folders', { method: 'POST', body: JSON.stringify(req) }), 'Failed to create deck folder');
}

export async function updateDeckFolder(folderId: number, req: UpdateFolderRequest): Promise<DeckFolder> {
  return json(fetchOrg(`/deck-folders/${folderId}`, { method: 'PATCH', body: JSON.stringify(req) }), 'Failed to update deck folder');
}

export async function deleteDeckFolder(folderId: number): Promise<void> {
  const res = await fetchOrg(`/deck-folders/${folderId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete deck folder');
}

export async function assignDeckFolder(deckId: number, folderId: number | null): Promise<{ deckId: number; folderId: number | null }> {
  return json(fetchOrg(`/decks/${deckId}/folder`, { method: 'PUT', body: JSON.stringify({ folderId }) }), 'Failed to assign folder to deck');
}

// --- In-deck Categories ---
export async function getDeckCategories(deckId: number): Promise<DeckCategory[]> {
  return json(fetchOrg(`/decks/${deckId}/categories`), 'Failed to fetch deck categories');
}

export async function createDeckCategory(deckId: number, req: CreateCategoryRequest): Promise<DeckCategory> {
  return json(fetchOrg(`/decks/${deckId}/categories`, { method: 'POST', body: JSON.stringify(req) }), 'Failed to create deck category');
}

export async function updateDeckCategory(deckId: number, categoryId: number, req: UpdateCategoryRequest): Promise<DeckCategory> {
  return json(fetchOrg(`/decks/${deckId}/categories/${categoryId}`, { method: 'PATCH', body: JSON.stringify(req) }), 'Failed to update deck category');
}

export async function deleteDeckCategory(deckId: number, categoryId: number): Promise<void> {
  const res = await fetchOrg(`/decks/${deckId}/categories/${categoryId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete deck category');
}

export async function moveCardsToCategory(deckId: number, categoryId: number, deckCardIds: number[]): Promise<{ success: boolean }> {
  return json(fetchOrg(`/decks/${deckId}/categories/${categoryId}/cards`, { method: 'PUT', body: JSON.stringify({ deckCardIds }) }), 'Failed to move cards to category');
}

export async function instantiateCategoriesFromTemplate(deckId: number, templateId: number): Promise<DeckCategory[]> {
  return json(fetchOrg(`/decks/${deckId}/categories/from-template`, { method: 'POST', body: JSON.stringify({ templateId }) }), 'Failed to instantiate categories from template');
}

// --- Category Templates ---
export async function getCategoryTemplates(): Promise<CategoryTemplate[]> {
  return json(fetchOrg('/category-templates'), 'Failed to fetch category templates');
}

export async function createCategoryTemplate(req: CreateCategoryTemplateRequest): Promise<CategoryTemplate> {
  return json(fetchOrg('/category-templates', { method: 'POST', body: JSON.stringify(req) }), 'Failed to create category template');
}

export async function updateCategoryTemplate(templateId: number, req: UpdateCategoryTemplateRequest): Promise<CategoryTemplate> {
  return json(fetchOrg(`/category-templates/${templateId}`, { method: 'PATCH', body: JSON.stringify(req) }), 'Failed to update category template');
}

export async function deleteCategoryTemplate(templateId: number): Promise<void> {
  const res = await fetchOrg(`/category-templates/${templateId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete category template');
}
