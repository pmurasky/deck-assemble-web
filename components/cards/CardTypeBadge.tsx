import React from 'react';

interface CardTypeBadgeProps {
  type: string;
  className?: string;
}

export function CardTypeBadge({ type, className = '' }: CardTypeBadgeProps) {
  // Extract just the main type before the em dash if it exists
  const mainType = type.split('—')[0].trim();
  
  return (
    <span className={`inline-flex items-center rounded-md bg-zinc-800/80 px-2 py-1 text-xs font-medium text-zinc-300 ring-1 ring-inset ring-zinc-700/50 ${className}`}>
      {mainType}
    </span>
  );
}
