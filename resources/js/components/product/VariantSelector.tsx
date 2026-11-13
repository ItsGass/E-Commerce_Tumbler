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
      <label className="block text-sm font-medium text-ink">
        Color / Finish
      </label>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Product variants">
        {variants.map((variant, index) => (
          <button
            key={variant.id}
            type="button"
            onClick={() => onSelect(index)}
            className={cn(
              'relative w-11 h-11 rounded-full border-3 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
              index === selectedIndex
                ? 'border-accent ring-2 ring-surface'
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
          />
        ))}
      </div>
      <p className="text-sm text-muted">
        {variants[selectedIndex]?.name}
      </p>
    </div>
  );
}
