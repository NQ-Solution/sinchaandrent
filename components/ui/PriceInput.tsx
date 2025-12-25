'use client';

import { forwardRef, useState, useEffect, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface PriceInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  label?: string;
  error?: string;
  value: string | number;
  onChange: (value: string) => void;
  suffix?: string;
}

// 숫자에 콤마 추가
const formatNumber = (value: string | number): string => {
  if (!value && value !== 0) return '';
  const numStr = String(value).replace(/[^0-9]/g, '');
  if (!numStr) return '';
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 콤마 제거하여 순수 숫자로 변환
const parseNumber = (value: string): string => {
  return value.replace(/[^0-9]/g, '');
};

const PriceInput = forwardRef<HTMLInputElement, PriceInputProps>(
  ({ className, label, error, id, value, onChange, suffix = '원', ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(formatNumber(value));

    useEffect(() => {
      setDisplayValue(formatNumber(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = parseNumber(e.target.value);
      setDisplayValue(formatNumber(rawValue));
      onChange(rawValue);
    };

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            className={cn(
              'flex h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-base',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              'placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50',
              suffix && 'pr-10',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            ref={ref}
            id={id}
            value={displayValue}
            onChange={handleChange}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              {suffix}
            </span>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
PriceInput.displayName = 'PriceInput';

export { PriceInput };
