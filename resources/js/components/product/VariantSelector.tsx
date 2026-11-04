'use client';

import { cn } from '@/lib/utils';

interface VariantSelectorProps {
  variants: Array<{
    id: number;
    name: string;
    color_hex: string;
    texture_url: string | null;
  }>;
  selectedIndex: number;
  onSelect: (index: number) => void;
  className?: string;
}

export function VariantSelector({ 
  variants, 
  selectedIndex, 
  onSelect, 
  className 
}: VariantSelectorProps) {
  if (variants.length <= 1) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Color / Finish
      </label>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Product variants">
        {variants.map((variant, index) => (
          <button
            key={variant.id}
            type="button"
            onClick={() => onSelect(index)}
            className={cn(
              'relative w-12 h-12 rounded-full border-3 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              index === selectedIndex
                ? 'border-primary-500 scale-110 shadow-lg ring-2 ring-white dark:ring-gray-900'
                : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'
            )}
            style={{
              backgroundColor: variant.texture_url 
                ? `url(${variant.texture_url})` 
                : variant.color_hex,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            aria-label={variant.name}
            aria-checked={index === selectedIndex}
            aria-pressed={index === selectedIndex}
            title={variant.name}
          >
            {index === selectedIndex && (
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs text-primary-600 dark:text-primary-400 font-medium whitespace-nowrap">
                {variant.name}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
