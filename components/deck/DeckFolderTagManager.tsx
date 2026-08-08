'use client';

import React, { useEffect, useState } from 'react';
import { FolderPlus, Tag, Folder, Plus, Loader2 } from 'lucide-react';
import type { DeckFolder, DeckTag } from '@/types/card';
import {
  getDeckFolders,
  createDeckFolder,
  getDeckTags,
  createDeckTag,
} from '@/lib/api/decks';

interface DeckFolderTagManagerProps {
  onSelectFolder?: (folderId: number | null) => void;
  onSelectTag?: (tagId: number | null) => void;
  activeFolderId?: number | null;
  activeTagId?: number | null;
}

export function DeckFolderTagManager({
  onSelectFolder,
  onSelectTag,
  activeFolderId,
  activeTagId,
}: DeckFolderTagManagerProps) {
  const [folders, setFolders] = useState<DeckFolder[]>([]);
  const [tags, setTags] = useState<DeckTag[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [foldersRes, tagsRes] = await Promise.all([getDeckFolders(), getDeckTags()]);
      setFolders(foldersRes);
      setTags(tagsRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organization data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await createDeckFolder({ name: newFolderName.trim() });
      setFolders((prev) => [...prev, created]);
      setNewFolderName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create folder');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await createDeckTag({ name: newTagName.trim(), color: '#a855f7' });
      setTags((prev) => [...prev, created]);
      setNewTagName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tag');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center text-xs text-zinc-500">Loading organization...</div>;
  }

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-6">
      {error && <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl">{error}</div>}

      {/* Folders Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
            <Folder className="w-4 h-4 text-purple-400" />
            <span>Folders</span>
          </div>
        </div>

        <form onSubmit={handleCreateFolder} className="flex gap-2">
          <input
            type="text"
            placeholder="New folder name..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            aria-label="Create Folder"
            disabled={isSubmitting || !newFolderName.trim()}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 shrink-0"
          >
            {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <FolderPlus className="w-3 h-3" />}
          </button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onSelectFolder && onSelectFolder(null)}
            className={`px-3 py-1 rounded-xl text-xs font-medium border transition-colors ${
              activeFolderId === null || activeFolderId === undefined
                ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Decks
          </button>
          {folders.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelectFolder && onSelectFolder(f.id)}
              className={`px-3 py-1 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                activeFolderId === f.id
                  ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Folder className="w-3 h-3 text-purple-400" />
              <span>{f.name}</span>
              {f.deckCount !== undefined && <span className="text-[10px] text-zinc-500 font-mono">({f.deckCount})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Tags Section */}
      <div className="space-y-3 pt-3 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
            <Tag className="w-4 h-4 text-purple-400" />
            <span>Tags</span>
          </div>
        </div>

        <form onSubmit={handleCreateTag} className="flex gap-2">
          <input
            type="text"
            placeholder="New tag name..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            aria-label="Create Tag"
            disabled={isSubmitting || !newTagName.trim()}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 shrink-0"
          >
            {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
          </button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onSelectTag && onSelectTag(null)}
            className={`px-3 py-1 rounded-xl text-xs font-medium border transition-colors ${
              activeTagId === null || activeTagId === undefined
                ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Tags
          </button>
          {tags.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTag && onSelectTag(t.id)}
              className={`px-3 py-1 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                activeTagId === t.id
                  ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>{t.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
