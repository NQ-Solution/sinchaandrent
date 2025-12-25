/**
 * API Route Tests for /api/brands
 *
 * These tests verify the brands API endpoint functionality.
 * Since Next.js API routes require a request/response context,
 * we test the underlying logic and mock the database layer.
 */

import { localDb, type Brand } from '@/lib/db';

// Mock the file system operations
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

describe('Brands API Logic', () => {
  const mockBrands: Brand[] = [
    {
      id: 'brand-hyundai',
      nameKr: '현대',
      nameEn: 'Hyundai',
      logo: '/logos/hyundai.png',
      isDomestic: true,
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'brand-kia',
      nameKr: '기아',
      nameEn: 'Kia',
      logo: '/logos/kia.png',
      isDomestic: true,
      isActive: true,
      sortOrder: 2,
    },
    {
      id: 'brand-bmw',
      nameKr: 'BMW',
      nameEn: 'BMW',
      logo: '/logos/bmw.png',
      isDomestic: false,
      isActive: false,
      sortOrder: 3,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    const fs = require('fs');
    fs.readFileSync.mockReturnValue(JSON.stringify(mockBrands));
  });

  describe('findMany', () => {
    it('should return all brands when no filter is applied', () => {
      const brands = localDb.brands.findMany();
      expect(brands).toHaveLength(3);
    });

    it('should filter active brands', () => {
      const brands = localDb.brands.findMany({ where: { isActive: true } });
      expect(brands).toHaveLength(2);
      expect(brands.every(b => b.isActive)).toBe(true);
    });

    it('should sort brands by sortOrder ascending', () => {
      const brands = localDb.brands.findMany({ orderBy: { sortOrder: 'asc' } });
      expect(brands[0].sortOrder).toBe(1);
      expect(brands[1].sortOrder).toBe(2);
      expect(brands[2].sortOrder).toBe(3);
    });

    it('should sort brands by sortOrder descending', () => {
      const brands = localDb.brands.findMany({ orderBy: { sortOrder: 'desc' } });
      expect(brands[0].sortOrder).toBe(3);
      expect(brands[1].sortOrder).toBe(2);
      expect(brands[2].sortOrder).toBe(1);
    });
  });

  describe('findUnique', () => {
    it('should find brand by id', () => {
      const brand = localDb.brands.findUnique({ where: { id: 'brand-hyundai' } });
      expect(brand).not.toBeNull();
      expect(brand?.nameKr).toBe('현대');
    });

    it('should return null for non-existent brand', () => {
      const brand = localDb.brands.findUnique({ where: { id: 'brand-nonexistent' } });
      expect(brand).toBeNull();
    });
  });

  describe('count', () => {
    it('should return total count', () => {
      const count = localDb.brands.count();
      expect(count).toBe(3);
    });

    it('should return count of active brands', () => {
      const count = localDb.brands.count({ where: { isActive: true } });
      expect(count).toBe(2);
    });
  });
});
