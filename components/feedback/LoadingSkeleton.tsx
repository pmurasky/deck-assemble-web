import React from 'react';

export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Search Bar Skeleton */}
      <div className="h-12 bg-black/40 border border-primary/10 rounded-md w-full"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filter Panel Skeleton */}
        <div className="hidden md:block col-span-1 h-[600px] bg-black/40 border border-primary/10 rounded-xl"></div>
        
        {/* Card Grid Skeleton */}
        <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-black/40 border border-primary/10 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
