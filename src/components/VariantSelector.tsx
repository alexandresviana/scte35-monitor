import type { VariantInfo } from '../types';

interface VariantSelectorProps {
  variants: VariantInfo[];
  selectedVariant: string;
  formatVariantLabel: (variant: VariantInfo, index: number) => string;
  onSelect: (url: string) => void;
}

export function VariantSelector({
  variants,
  selectedVariant,
  formatVariantLabel,
  onSelect,
}: VariantSelectorProps) {
  if (variants.length <= 1) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="mb-2 text-sm font-semibold text-slate-800">Variante do stream</h3>
      <select
        value={selectedVariant}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        {variants.map((variant, index) => (
          <option key={variant.url} value={variant.url}>
            {formatVariantLabel(variant, index)}
          </option>
        ))}
      </select>
    </div>
  );
}
