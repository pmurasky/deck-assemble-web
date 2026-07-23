import React from 'react';
import { CheckCircle2, ShoppingCart, Printer } from 'lucide-react';
import { OwnershipStatus } from '@/types/builder';

interface OwnershipBadgeProps {
  status: OwnershipStatus;
  price?: number;
  className?: string;
}

export const OwnershipBadge: React.FC<OwnershipBadgeProps> = ({ status, price, className = '' }) => {
  if (status === 'owned') {
    return (
      <span
        data-testid="ownership-badge-owned"
        data-status="owned"
        aria-label="Status: Owned card"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 ${className}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
        <span>Owned</span>
      </span>
    );
  }

  if (status === 'wishlist') {
    return (
      <span
        data-testid="ownership-badge-wishlist"
        data-status="wishlist"
        aria-label={`Status: Wishlist card${price !== undefined ? `, cost $${price.toFixed(2)}` : ''}`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/60 border border-amber-500/30 text-amber-300 ${className}`}
      >
        <ShoppingCart className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
        <span>Wishlist</span>
        {price !== undefined && (
          <span className="font-mono text-amber-200 ml-0.5">${price.toFixed(2)}</span>
        )}
      </span>
    );
  }

  return (
    <span
      data-testid="ownership-badge-proxy"
      data-status="proxy"
      aria-label="Status: Proxy card"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-950/60 border border-purple-500/30 text-purple-300 ${className}`}
    >
      <Printer className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
      <span>Proxy</span>
    </span>
  );
};
