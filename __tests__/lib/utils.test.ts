import { formatPrice, formatPriceWithUnit, getCategoryLabel, getFuelTypeLabel, getDriveTypeLabel, cn } from '@/lib/utils';

describe('utils', () => {
  describe('formatPrice', () => {
    it('should format number with Korean locale', () => {
      expect(formatPrice(1000)).toBe('1,000');
      expect(formatPrice(1000000)).toBe('1,000,000');
      expect(formatPrice(0)).toBe('0');
    });

    it('should handle large numbers', () => {
      expect(formatPrice(999999999)).toBe('999,999,999');
    });
  });

  describe('formatPriceWithUnit', () => {
    it('should format price with 만 unit', () => {
      expect(formatPriceWithUnit(10000)).toBe('1만');
      expect(formatPriceWithUnit(50000)).toBe('5만');
      expect(formatPriceWithUnit(100000)).toBe('10만');
    });

    it('should format price with 만 and remainder', () => {
      expect(formatPriceWithUnit(15000)).toBe('1만 5,000');
      expect(formatPriceWithUnit(12345)).toBe('1만 2,345');
    });

    it('should format small numbers without 만 unit', () => {
      expect(formatPriceWithUnit(9999)).toBe('9,999');
      expect(formatPriceWithUnit(1000)).toBe('1,000');
    });
  });

  describe('getCategoryLabel', () => {
    it('should return Korean label for known categories', () => {
      expect(getCategoryLabel('SEDAN')).toBe('세단');
      expect(getCategoryLabel('SUV')).toBe('SUV');
      expect(getCategoryLabel('TRUCK')).toBe('트럭');
      expect(getCategoryLabel('VAN')).toBe('밴');
      expect(getCategoryLabel('EV')).toBe('전기차');
    });

    it('should return original value for unknown categories', () => {
      expect(getCategoryLabel('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('getFuelTypeLabel', () => {
    it('should return Korean label for known fuel types', () => {
      expect(getFuelTypeLabel('GASOLINE')).toBe('가솔린');
      expect(getFuelTypeLabel('DIESEL')).toBe('디젤');
      expect(getFuelTypeLabel('HYBRID')).toBe('하이브리드');
      expect(getFuelTypeLabel('EV')).toBe('전기');
      expect(getFuelTypeLabel('LPG')).toBe('LPG');
    });

    it('should return original value for unknown fuel types', () => {
      expect(getFuelTypeLabel('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('getDriveTypeLabel', () => {
    it('should return label for known drive types', () => {
      expect(getDriveTypeLabel('전륜구동')).toBe('2WD');
      expect(getDriveTypeLabel('후륜구동')).toBe('RWD');
      expect(getDriveTypeLabel('사륜구동')).toBe('AWD');
      expect(getDriveTypeLabel('FWD')).toBe('2WD');
      expect(getDriveTypeLabel('RWD')).toBe('RWD');
      expect(getDriveTypeLabel('AWD')).toBe('AWD');
      expect(getDriveTypeLabel('4WD')).toBe('4WD');
    });

    it('should return original value for unknown drive types', () => {
      expect(getDriveTypeLabel('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('cn', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      expect(cn('foo', true && 'bar', false && 'baz')).toBe('foo bar');
    });

    it('should merge tailwind classes properly', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2');
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });
  });
});
