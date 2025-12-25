'use client';

import { cn } from '@/lib/utils';
import type { Trim } from '@/types';

interface TrimSelectorProps {
  trims: Trim[];
  selectedTrimId?: string;
  onTrimSelect: (trimId: string) => void;
}

export function TrimSelector({ trims, selectedTrimId, onTrimSelect }: TrimSelectorProps) {
  if (trims.length === 0) {
    return null;
  }

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-2">트림 선택</h4>
      <div className="space-y-2">
        {trims.map((trim) => (
          <button
            key={trim.id}
            onClick={() => onTrimSelect(trim.id)}
            className={cn(
              'w-full p-4 rounded-lg border text-left transition-all',
              selectedTrimId === trim.id
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-400'
            )}
          >
            <p className="font-medium text-gray-900">{trim.name}</p>
            {trim.description && <p className="text-sm text-gray-500 mt-1">{trim.description}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}
