'use client';

import React, { useState, useMemo } from 'react';
import { Search, X, BookOpen } from 'lucide-react';
import {
  GLOSSARY_ITEMS,
  GLOSSARY_CATEGORIES,
  KEYWORDS,
  type GlossaryItem,
  type KeywordItem,
} from '@/lib/keywords';

export type { KeywordItem, GlossaryItem };
export { KEYWORDS, GLOSSARY_ITEMS };

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function GlossaryCard({ item }: { item: GlossaryItem }) {
  return (
    <div
      id={`glossary-${toSlug(item.name)}`}
      data-testid="keyword-card"
      className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:bg-zinc-800/50 transition-colors flex flex-col justify-between scroll-mt-36"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <h3 className="font-bold text-lg text-zinc-100">{item.name}</h3>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60">
            {item.category}
          </span>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">{item.description}</p>
      </div>
    </div>
  );
}

function ClearInputButton({ onClear }: { onClear: () => void }) {
  return (
    <button
      type="button"
      aria-label="Clear search input"
      onClick={onClear}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
    >
      <X className="w-4 h-4" />
    </button>
  );
}

function SearchBar({
  query,
  onChange,
  onClear,
}: {
  query: string;
  onChange: (v: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
      <input
        type="search"
        role="searchbox"
        aria-label="Search glossary"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search keywords, rules concepts, stack, priority..."
        className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-green-500/60 transition-colors"
      />
      {query && <ClearInputButton onClear={onClear} />}
    </div>
  );
}

function CategoryPillButton({
  category,
  isActive,
  onSelect,
}: {
  category: string;
  isActive: boolean;
  onSelect: (cat: string) => void;
}) {
  const activeClass = 'bg-green-500/20 text-green-400 border border-green-500/40 shadow-sm';
  const inactiveClass = 'bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200';
  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${isActive ? activeClass : inactiveClass}`}
    >
      {category}
    </button>
  );
}

function CategoryPills({
  categories,
  selectedCategory,
  onSelect,
}: {
  categories: string[];
  selectedCategory: string;
  onSelect: (cat: string) => void;
}) {
  const allCategories = ['All', ...categories];
  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((cat) => (
        <CategoryPillButton
          key={cat}
          category={cat}
          isActive={selectedCategory === cat}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function EmptyGlossaryState({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-12 px-4 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
      <BookOpen className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
      <h4 className="text-base font-semibold text-zinc-300">No glossary entries found</h4>
      <p className="text-sm text-zinc-500 mt-1 max-w-md mx-auto">
        Try checking for typos or clear your search filters to browse all keywords and rules.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 rounded-lg transition-colors cursor-pointer"
      >
        Clear search & filters
      </button>
    </div>
  );
}

function GlossaryHeader() {
  return (
    <div className="border-b border-zinc-800 pb-4">
      <h2 className="text-3xl font-extrabold text-white">Rules & Keyword Glossary</h2>
      <p className="text-zinc-400 mt-2 text-lg">
        Searchable rules definitions, combat steps, stack timing, and keyword abilities.
      </p>
    </div>
  );
}

function GlossaryControls({
  searchQuery,
  onSearchChange,
  onClearSearch,
  selectedCategory,
  onSelectCategory,
  filteredCount,
  totalCount,
}: {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onClearSearch: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  filteredCount: number;
  totalCount: number;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <SearchBar query={searchQuery} onChange={onSearchChange} onClear={onClearSearch} />
        <div className="text-xs text-zinc-500 whitespace-nowrap self-center">
          Showing {filteredCount} of {totalCount} entries
        </div>
      </div>
      <CategoryPills
        categories={GLOSSARY_CATEGORIES}
        selectedCategory={selectedCategory}
        onSelect={onSelectCategory}
      />
    </div>
  );
}

function GlossaryGrid({ items }: { items: GlossaryItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <GlossaryCard key={item.name} item={item} />
      ))}
    </div>
  );
}

function matchesSearchAndCategory(item: GlossaryItem, query: string, category: string): boolean {
  const matchesCat = category === 'All' || item.category === category;
  if (!matchesCat) return false;
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    item.name.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q)
  );
}

export function KeywordGlossarySection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim();
    return GLOSSARY_ITEMS.filter((item) => matchesSearchAndCategory(item, q, selectedCategory));
  }, [searchQuery, selectedCategory]);

  return (
    <section id="keywords" className="scroll-mt-32 space-y-6">
      <GlossaryHeader />
      <GlossaryControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={() => setSearchQuery('')}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        filteredCount={filteredItems.length}
        totalCount={GLOSSARY_ITEMS.length}
      />
      {filteredItems.length === 0 ? (
        <EmptyGlossaryState onReset={() => { setSearchQuery(''); setSelectedCategory('All'); }} />
      ) : (
        <GlossaryGrid items={filteredItems} />
      )}
    </section>
  );
}


