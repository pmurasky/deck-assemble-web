import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface CardSearchBarProps {
  onSearch: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

export function CardSearchBar({ onSearch, defaultValue = '', placeholder = 'Search Marvel heroes...', className = '' }: CardSearchBarProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <Input
        type="search"
        placeholder={placeholder}
        defaultValue={defaultValue}
        onChange={handleChange}
        className="pl-10 h-12 bg-black/40 border-primary/20 backdrop-blur-md focus-visible:ring-primary/50 text-base"
      />
    </div>
  );
}
