'use client';

import { cn } from '@/lib/utils';
import type { Option } from '@/types';
import { Check } from 'lucide-react';

interface OptionListProps {
  options: Option[];
  selectedOptionIds: string[];
  onOptionToggle: (optionId: string) => void;
}

export function OptionList({ options, selectedOptionIds, onOptionToggle }: OptionListProps) {
  if (options.length === 0) {
    return null;
  }

  // Group options by category
  const groupedOptions = options.reduce(
    (acc, option) => {
      const category = option.category || '기타';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(option);
      return acc;
    },
    {} as Record<string, Option[]>
  );

  return (
    <div className="space-y-6">
      {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
        <div key={category}>
          <h4 className="text-sm font-medium text-gray-700 mb-3">{category}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categoryOptions.map((option) => {
              const isSelected = selectedOptionIds.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => onOptionToggle(option.id)}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border text-left transition-all',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-400'
                  )}
                >
                  <div
                    className={cn(
                      'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5',
                      isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{option.name}</p>
                    {option.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
