import React from 'react';

export interface CardFilters {
  colors: string[];
  types: string[];
  manaValue: number;
}

interface CardFilterPanelProps {
  filters: CardFilters;
  onFilterChange: (filters: CardFilters) => void;
  className?: string;
}

export function CardFilterPanel({ filters, onFilterChange, className = '' }: CardFilterPanelProps) {
  const handleColorToggle = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color];
    
    onFilterChange({ ...filters, colors: newColors });
  };

  return (
    <div className={`p-4 rounded-xl border border-primary/20 bg-black/40 backdrop-blur-md ${className}`}>
      <h3 className="font-semibold text-lg mb-4 text-primary">Filters</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-2 text-sm text-muted-foreground">Color</h4>
          <div className="flex flex-col space-y-2">
            {['R', 'U', 'B', 'G', 'W'].map(color => (
              <label key={color} className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={filters.colors.includes(color)}
                  onChange={() => handleColorToggle(color)}
                  className="rounded border-primary/50 text-primary focus:ring-primary bg-transparent"
                />
                <span className="text-sm">
                  {color === 'R' ? 'Red' : 
                   color === 'U' ? 'Blue' : 
                   color === 'B' ? 'Black' : 
                   color === 'G' ? 'Green' : 'White'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2 text-sm text-muted-foreground">Card Type</h4>
          {/* Implement type filters similarly */}
          <div className="text-sm text-muted-foreground italic">Coming soon...</div>
        </div>

        <div>
          <h4 className="font-medium mb-2 text-sm text-muted-foreground">Mana Value</h4>
          {/* Implement mana value slider/input */}
          <div className="text-sm text-muted-foreground italic">Coming soon...</div>
        </div>
      </div>
    </div>
  );
}
