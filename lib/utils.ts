import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR').format(price);
}

export function formatPriceWithUnit(price: number): string {
  if (price >= 10000) {
    const man = Math.floor(price / 10000);
    const remainder = price % 10000;
    if (remainder === 0) {
      return `${man}만`;
    }
    return `${man}만 ${formatPrice(remainder)}`;
  }
  return formatPrice(price);
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    SEDAN: '세단',
    SUV: 'SUV',
    TRUCK: '트럭',
    VAN: '밴',
    EV: '전기차',
    COMPACT: '소형',
    HATCHBACK: '해치백',
    COUPE: '쿠페',
    CONVERTIBLE: '컨버터블/오픈카',
  };
  return labels[category] || category;
}

export function getFuelTypeLabel(fuelType: string): string {
  const labels: Record<string, string> = {
    GASOLINE: '가솔린',
    DIESEL: '디젤',
    HYBRID: '하이브리드',
    EV: '전기',
    LPG: 'LPG',
  };
  return labels[fuelType] || fuelType;
}

export function getDriveTypeLabel(driveType: string): string {
  const labels: Record<string, string> = {
    '전륜구동': '2WD',
    '후륜구동': 'RWD',
    '사륜구동': 'AWD',
    'FWD': '2WD',
    'RWD': 'RWD',
    'AWD': 'AWD',
    '4WD': '4WD',
  };
  return labels[driveType] || driveType;
}
