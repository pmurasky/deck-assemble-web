'use client';

import React, { useState, useId, useMemo } from 'react';
import { KEYWORDS, getKeyword, getGlossaryItem, type GlossaryItem } from '@/lib/keywords';

interface KeywordTooltipProps {
  keyword: string;
  children?: React.ReactNode;
  className?: string;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function TooltipPopover({
  item,
  id,
}: {
  item: GlossaryItem;
  id: string;
}) {
  return (
    <div
      id={id}
      role="tooltip"
      data-testid="keyword-tooltip-content"
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 max-w-xs p-3 rounded-xl bg-zinc-950/95 border border-zinc-700 text-left shadow-2xl backdrop-blur-md transition-all duration-150 pointer-events-auto"
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="font-bold text-xs text-zinc-100">{item.name}</span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-purple-300 border border-zinc-700/80">
          {item.category}
        </span>
      </div>
      <p className="text-xs text-zinc-300 leading-relaxed font-normal">{item.description}</p>
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-zinc-700" />
    </div>
  );
}

export function KeywordTooltip({
  keyword,
  children,
  className = '',
}: KeywordTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useId();
  const item = getKeyword(keyword) || getGlossaryItem(keyword);

  if (!item) {
    return <span className={className}>{children ?? keyword}</span>;
  }

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        aria-describedby={isOpen ? tooltipId : undefined}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-block font-medium text-emerald-400 hover:text-emerald-300 underline decoration-dotted decoration-emerald-500/60 underline-offset-2 transition-colors cursor-help bg-transparent p-0 border-0 text-inherit text-left ${className}`}
      >
        {children ?? item.name}
      </button>
      {isOpen && <TooltipPopover item={item} id={tooltipId} />}
    </span>
  );
}

interface KeywordHighlighterProps {
  text: string;
  className?: string;
}

export function KeywordHighlighter({ text, className = '' }: KeywordHighlighterProps) {
  const keywordRegex = useMemo(() => {
    const sortedNames = [...KEYWORDS]
      .map((k) => k.name)
      .sort((a, b) => b.length - a.length);
    const pattern = sortedNames.map(escapeRegex).join('|');
    return new RegExp(`\\b(${pattern})\\b`, 'gi');
  }, []);

  if (!text) return null;

  const parts = text.split(keywordRegex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const item = getKeyword(part) || getGlossaryItem(part);
        if (item) {
          return (
            <KeywordTooltip key={`${part}-${index}`} keyword={part}>
              {part}
            </KeywordTooltip>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}
