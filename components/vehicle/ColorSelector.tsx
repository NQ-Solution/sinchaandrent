'use client';

import { cn } from '@/lib/utils';
import type { Color, ColorType } from '@/types';
import { Check } from 'lucide-react';

interface ColorSelectorProps {
  colors: Color[];
  type: ColorType;
  selectedColorId?: string;
  onColorSelect: (colorId: string) => void;
}

export function ColorSelector({
  colors,
  type,
  selectedColorId,
  onColorSelect,
}: ColorSelectorProps) {
  const filteredColors = colors.filter((color) => color.type === type);

  if (filteredColors.length === 0) {
    return null;
  }

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-2">
        {type === 'EXTERIOR' ? '외장 색상' : '내장 색상'}
      </h4>
      <div className="flex flex-wrap gap-3">
        {filteredColors.map((color) => (
          <button
            key={color.id}
            onClick={() => onColorSelect(color.id)}
            className={cn(
              'relative w-10 h-10 rounded-full border-2 transition-all',
              selectedColorId === color.id
                ? 'border-primary ring-2 ring-primary ring-offset-2'
                : 'border-gray-200 hover:border-gray-400'
            )}
            style={{ backgroundColor: color.hexCode }}
            title={color.name}
          >
            {selectedColorId === color.id && (
              <Check
                className={cn(
                  'w-5 h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                  isLightColor(color.hexCode) ? 'text-gray-800' : 'text-white'
                )}
              />
            )}
          </button>
        ))}
      </div>
      {selectedColorId && (
        <p className="text-sm text-gray-500 mt-2">
          {filteredColors.find((c) => c.id === selectedColorId)?.name}
        </p>
      )}
    </div>
  );
}

function isLightColor(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
}
