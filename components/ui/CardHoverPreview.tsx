'use client';

import React, { useState, useId } from 'react';
import { ManaCost } from '@/components/cards/ManaCost';

interface CardHoverPreviewProps {
  cardName: string;
  imageUrl?: string;
  manaCost?: string;
  children?: React.ReactNode;
  className?: string;
}

function resolveCardImageUrl(cardName: string, imageUrl?: string): string {
  if (imageUrl) return imageUrl;
  if (!cardName) return '';
  return `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}&format=image`;
}

interface CardPreviewPopoverProps {
  id: string;
  cardName: string;
  imageUrl: string;
  manaCost?: string;
}

function CardPreviewPopover({ id, cardName, imageUrl, manaCost }: CardPreviewPopoverProps) {
  return (
    <div
      id={id}
      role="tooltip"
      data-testid="card-hover-preview-popover"
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-52 p-2.5 rounded-xl bg-zinc-950/95 border border-zinc-700 text-left shadow-2xl backdrop-blur-md transition-all duration-150 pointer-events-auto"
    >
      <div className="flex items-center justify-between gap-1.5 mb-2 px-0.5">
        <span className="font-bold text-xs text-zinc-100 truncate">{cardName}</span>
        {manaCost && <ManaCost manaCost={manaCost} />}
      </div>
      <div className="relative w-full aspect-[2.5/3.5] rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800/80">
        <img
          src={imageUrl}
          alt={cardName}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-zinc-700" />
    </div>
  );
}

export function CardHoverPreview({
  cardName,
  imageUrl,
  manaCost,
  children,
  className = '',
}: CardHoverPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useId();

  if (!cardName) {
    return <span className={className}>{children}</span>;
  }

  const activeImageUrl = resolveCardImageUrl(cardName, imageUrl);

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
        className={`inline-block text-left bg-transparent p-0 border-0 text-inherit cursor-pointer ${className}`}
      >
        {children ?? cardName}
      </button>
      {isOpen && (
        <CardPreviewPopover
          id={tooltipId}
          cardName={cardName}
          imageUrl={activeImageUrl}
          manaCost={manaCost}
        />
      )}
    </span>
  );
}
