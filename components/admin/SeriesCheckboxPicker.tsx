import type { CardSeries } from '@/lib/api/imports';

interface SeriesCheckboxItemProps {
  item: CardSeries;
  checked: boolean;
  disabled: boolean;
  onToggle: (key: string) => void;
}

function SeriesCheckboxItem({ item, checked, disabled, onToggle }: SeriesCheckboxItemProps) {
  const activeClass = checked
    ? 'border-green-500/60 bg-green-950/30 text-white'
    : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700';

  return (
    <label
      htmlFor={`series-checkbox-${item.key}`}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm select-none cursor-pointer transition-colors ${activeClass} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <input
        id={`series-checkbox-${item.key}`}
        type="checkbox"
        value={item.key}
        checked={checked}
        disabled={disabled}
        onChange={() => onToggle(item.key)}
        className="w-4 h-4 rounded border-zinc-700 text-green-500 focus:ring-green-500/30 bg-zinc-900 cursor-pointer disabled:cursor-not-allowed"
      />
      <span className="font-medium text-xs sm:text-sm">{item.label}</span>
    </label>
  );
}

interface SeriesCheckboxPickerProps {
  series: CardSeries[];
  selectedKeys: string[];
  onChange: (keys: string[]) => void;
  disabled?: boolean;
}

export function SeriesCheckboxPicker({
  series,
  selectedKeys,
  onChange,
  disabled = false,
}: SeriesCheckboxPickerProps) {
  const handleToggle = (key: string) => {
    if (selectedKeys.includes(key)) {
      onChange(selectedKeys.filter((k) => k !== key));
    } else {
      onChange([...selectedKeys, key]);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {series.map((item) => (
        <SeriesCheckboxItem
          key={item.key}
          item={item}
          checked={selectedKeys.includes(item.key)}
          disabled={disabled}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
}
