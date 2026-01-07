/**
 * API Route Tests for /api/vehicles
 *
 * These tests verify the vehicles API endpoint functionality.
 */

import { localDb, type Vehicle, type Brand } from '@/lib/db';

// Mock the file system operations
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

describe('Vehicles API Logic', () => {
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
  ];

  const mockVehicles: Vehicle[] = [
    {
      id: 'hdsuv-santafe',
      name: '싼타페',
      brandId: 'brand-hyundai',
      category: 'SUV',
      fuelTypes: ['GASOLINE', 'DIESEL'],
      driveTypes: ['AWD'],
      seatingCapacityMin: 5,
      seatingCapacityMax: 7,
      basePrice: 35000000,
      rentPrice60_0: 450000,
      rentPrice48_0: 500000,
      rentPrice36_0: 550000,
      rentPrice24_0: 650000,
      rentPrice60_30: 400000,
      rentPrice48_30: 450000,
      rentPrice36_30: 500000,
      rentPrice24_30: 600000,
      rentPrice60_40: 350000,
      rentPrice48_40: 400000,
      rentPrice36_40: 450000,
      rentPrice24_40: 550000,
      thumbnail: '/images/santafe.jpg',
      images: [],
      imageSizePreset: 'vehicle',
      imagePadding: 0,
      isPopular: true,
      isNew: false,
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'hdsed-sonata',
      name: '쏘나타',
      brandId: 'brand-hyundai',
      category: 'SEDAN',
      fuelTypes: ['GASOLINE', 'HYBRID'],
      driveTypes: ['FWD'],
      seatingCapacityMin: 5,
      seatingCapacityMax: 5,
      basePrice: 30000000,
      rentPrice60_0: 380000,
      rentPrice48_0: 420000,
      rentPrice36_0: 460000,
      rentPrice24_0: 540000,
      rentPrice60_30: 340000,
      rentPrice48_30: 380000,
      rentPrice36_30: 420000,
      rentPrice24_30: 500000,
      rentPrice60_40: 300000,
      rentPrice48_40: 340000,
      rentPrice36_40: 380000,
      rentPrice24_40: 460000,
      thumbnail: '/images/sonata.jpg',
      images: [],
      imageSizePreset: 'vehicle',
      imagePadding: 0,
      isPopular: false,
      isNew: true,
      isActive: true,
      sortOrder: 2,
    },
    {
      id: 'hdsuv-tucson',
      name: '투싼',
      brandId: 'brand-hyundai',
      category: 'SUV',
      fuelTypes: ['DIESEL'],
      driveTypes: ['AWD', 'FWD'],
      seatingCapacityMin: 5,
      seatingCapacityMax: 5,
      basePrice: 32000000,
      rentPrice60_0: 400000,
      rentPrice48_0: 440000,
      rentPrice36_0: 480000,
      rentPrice24_0: 560000,
      rentPrice60_30: 360000,
      rentPrice48_30: 400000,
      rentPrice36_30: 440000,
      rentPrice24_30: 520000,
      rentPrice60_40: 320000,
      rentPrice48_40: 360000,
      rentPrice36_40: 400000,
      rentPrice24_40: 480000,
      thumbnail: '/images/tucson.jpg',
      images: [],
      imageSizePreset: 'vehicle',
      imagePadding: 0,
      isPopular: false,
      isNew: false,
      isActive: false,
      sortOrder: 3,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    const fs = require('fs');
    fs.readFileSync.mockImplementation((filePath: string) => {
      if (filePath.includes('vehicles.json')) {
        return JSON.stringify(mockVehicles);
      }
      if (filePath.includes('brands.json')) {
        return JSON.stringify(mockBrands);
      }
      return '[]';
    });
  });

  describe('findMany', () => {
    it('should return all vehicles when no filter is applied', () => {
      const vehicles = localDb.vehicles.findMany();
      expect(vehicles).toHaveLength(3);
    });

    it('should filter active vehicles', () => {
      const vehicles = localDb.vehicles.findMany({ where: { isActive: true } });
      expect(vehicles).toHaveLength(2);
      expect(vehicles.every(v => (v as Vehicle).isActive)).toBe(true);
    });

    it('should filter popular vehicles', () => {
      const vehicles = localDb.vehicles.findMany({ where: { isPopular: true } });
      expect(vehicles).toHaveLength(1);
      expect((vehicles[0] as Vehicle).name).toBe('싼타페');
    });

    it('should filter by category', () => {
      const vehicles = localDb.vehicles.findMany({ where: { category: 'SUV' } });
      expect(vehicles).toHaveLength(2);
      expect(vehicles.every(v => (v as Vehicle).category === 'SUV')).toBe(true);
    });

    it('should filter by brandId', () => {
      const vehicles = localDb.vehicles.findMany({ where: { brandId: 'brand-hyundai' } });
      expect(vehicles).toHaveLength(3);
    });

    it('should include brand information', () => {
      const vehicles = localDb.vehicles.findMany({ include: { brand: true } });
      expect(vehicles[0]).toHaveProperty('brand');
      expect((vehicles[0] as any).brand.nameKr).toBe('현대');
    });

    it('should sort by sortOrder ascending', () => {
      const vehicles = localDb.vehicles.findMany({ orderBy: { sortOrder: 'asc' } });
      expect((vehicles[0] as Vehicle).sortOrder).toBe(1);
      expect((vehicles[2] as Vehicle).sortOrder).toBe(3);
    });
  });

  describe('findUnique', () => {
    it('should find vehicle by id', () => {
      const vehicle = localDb.vehicles.findUnique({ where: { id: 'hdsuv-santafe' } });
      expect(vehicle).not.toBeNull();
      expect((vehicle as Vehicle).name).toBe('싼타페');
    });

    it('should return null for non-existent vehicle', () => {
      const vehicle = localDb.vehicles.findUnique({ where: { id: 'nonexistent' } });
      expect(vehicle).toBeNull();
    });

    it('should include brand when requested', () => {
      const vehicle = localDb.vehicles.findUnique({
        where: { id: 'hdsuv-santafe' },
        include: { brand: true },
      });
      expect(vehicle).toHaveProperty('brand');
      expect((vehicle as any).brand.nameKr).toBe('현대');
    });
  });

  describe('count', () => {
    it('should return total count', () => {
      const count = localDb.vehicles.count();
      expect(count).toBe(3);
    });

    it('should return count of active vehicles', () => {
      const count = localDb.vehicles.count({ where: { isActive: true } });
      expect(count).toBe(2);
    });

    it('should return count of popular vehicles', () => {
      const count = localDb.vehicles.count({ where: { isPopular: true } });
      expect(count).toBe(1);
    });
  });
});
