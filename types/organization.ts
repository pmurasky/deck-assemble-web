export interface DeckTag {
  id: number;
  name: string;
  color?: string;
  createdAt?: string;
}

export interface DeckFolder {
  id: number;
  name: string;
  parentId?: number | null;
  createdAt?: string;
}

export interface DeckCategory {
  id: number;
  deckId: number;
  name: string;
  displayOrder?: number;
}

export interface CategoryTemplate {
  id: number;
  name: string;
  defaultCategories: string[];
  createdAt?: string;
}

export interface CreateTagRequest {
  name: string;
  color?: string;
}

export interface UpdateTagRequest {
  name?: string;
  color?: string;
}

export interface CreateFolderRequest {
  name: string;
  parentId?: number | null;
}

export interface UpdateFolderRequest {
  name?: string;
  parentId?: number | null;
}

export interface CreateCategoryRequest {
  name: string;
  displayOrder?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  displayOrder?: number;
}

export interface CreateCategoryTemplateRequest {
  name: string;
  defaultCategories: string[];
}

export interface UpdateCategoryTemplateRequest {
  name?: string;
  defaultCategories?: string[];
}
