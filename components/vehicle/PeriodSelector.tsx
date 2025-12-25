'use client';

import { cn } from '@/lib/utils';
import type { RentPeriod } from '@/types';

interface PeriodSelectorProps {
  selectedPeriod: RentPeriod;
  onPeriodChange: (period: RentPeriod) => void;
  availablePeriods?: RentPeriod[];
}

const periods: RentPeriod[] = [24, 36, 48, 60];

export function PeriodSelector({
  selectedPeriod,
  onPeriodChange,
  availablePeriods = periods,
}: PeriodSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {availablePeriods.map((period) => (
        <button
          key={period}
          onClick={() => onPeriodChange(period)}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-colors',
            selectedPeriod === period
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          {period}개월
        </button>
      ))}
    </div>
  );
}
