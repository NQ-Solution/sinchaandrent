import fs from 'fs';
import path from 'path';

// DB 모드: 'local' (JSON 파일) 또는 'postgres' (외부 DB)
export const DB_MODE = process.env.DB_MODE || 'local';

const dataDir = path.join(process.cwd(), 'data');

// 로컬 DB용 타입 정의 (createdAt, updatedAt 불필요)
export interface Brand {
  id: string;
  name?: string;
  nameKr: string;
  nameEn?: string | null;
  logo?: string | null;
  isDomestic: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface Vehicle {
  id: string;
  name: string;
  brandId: string;
  category: string;
  fuelTypes: string[];
  driveTypes: string[];
  seatingCapacityMin: number | null;
  seatingCapacityMax: number | null;
  basePrice: number;
  rentPrice60_0: number | null;
  rentPrice48_0: number | null;
  rentPrice36_0: number | null;
  rentPrice24_0: number | null;
  rentPrice60_25: number | null;
  rentPrice48_25: number | null;
  rentPrice36_25: number | null;
  rentPrice24_25: number | null;
  rentPrice60_50: number | null;
  rentPrice48_50: number | null;
  rentPrice36_50: number | null;
  rentPrice24_50: number | null;
  thumbnail: string | null;
  images: string[];
  imageSizePreset: string | null;
  imagePadding: number | null;
  isPopular: boolean;
  isNew: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface VehicleWithBrand extends Vehicle {
  brand: Brand;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Trim {
  id: string;
  vehicleId: string;
  name: string;
  price: number;
  description: string | null;
  sortOrder: number;
}

export interface Color {
  id: string;
  vehicleId: string;
  type: 'EXTERIOR' | 'INTERIOR';
  name: string;
  hexCode: string;
  price: number;
  sortOrder: number;
}

export interface VehicleOption {
  id: string;
  vehicleId: string;
  name: string;
  price: number;
  description: string | null;
  category: string | null;
  sortOrder: number;
}

export interface LocalAdmin {
  id: string;
  email: string;
  password: string;
  name: string;
}

export interface Settings {
  [key: string]: string;
}

// JSON 파일 읽기/쓰기 헬퍼
function readJsonFile<T>(filename: string): T {
  const filePath = path.join(dataDir, filename);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

function writeJsonFile<T>(filename: string, data: T): void {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// 고유 ID 생성
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 브랜드 약어 매핑
const BRAND_CODES: Record<string, string> = {
  'brand-hyundai': 'hd',
  'brand-kia': 'ki',
  'brand-genesis': 'gn',
  'brand-renault': 'rn',
  'brand-kg': 'kg',
  'brand-chevrolet': 'cv',
  'brand-bmw': 'bm',
  'brand-benz': 'bz',
  'brand-audi': 'ad',
  'brand-volkswagen': 'vw',
  'brand-toyota': 'ty',
  'brand-honda': 'hd',
  'brand-nissan': 'ns',
  'brand-volvo': 'vo',
  'brand-tesla': 'ts',
};

// 카테고리 약어 매핑
const CATEGORY_CODES: Record<string, string> = {
  'SEDAN': 'sed',
  'SUV': 'suv',
  'TRUCK': 'trk',
  'VAN': 'van',
  'EV': 'ev',
};

// 차량 ID 생성 (브랜드코드 + 카테고리코드 + 차량명)
export function generateVehicleId(brandId: string, category: string, vehicleName: string): string {
  const brandCode = BRAND_CODES[brandId] || brandId.replace('brand-', '').substring(0, 2);
  const categoryCode = CATEGORY_CODES[category] || category.toLowerCase().substring(0, 3);
  // 차량명에서 공백 제거하고 영문/숫자만 추출, 소문자로 변환
  const nameCode = vehicleName
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9가-힣]/g, '');

  return `${brandCode}${categoryCode}-${nameCode}`;
}

// ==================== Brands ====================
export const localDb = {
  brands: {
    findMany: (options?: { where?: { isActive?: boolean }; orderBy?: { sortOrder?: 'asc' | 'desc' } }): Brand[] => {
      let brands = readJsonFile<Brand[]>('brands.json');

      if (options?.where?.isActive !== undefined) {
        brands = brands.filter(b => b.isActive === options.where!.isActive);
      }

      if (options?.orderBy?.sortOrder) {
        brands.sort((a, b) =>
          options.orderBy!.sortOrder === 'asc'
            ? a.sortOrder - b.sortOrder
            : b.sortOrder - a.sortOrder
        );
      }

      return brands;
    },

    findUnique: (options: { where: { id: string } }): Brand | null => {
      const brands = readJsonFile<Brand[]>('brands.json');
      return brands.find(b => b.id === options.where.id) || null;
    },

    create: (options: { data: Omit<Brand, 'id'> }): Brand => {
      const brands = readJsonFile<Brand[]>('brands.json');
      const newBrand: Brand = {
        id: generateId('brand'),
        ...options.data,
      };
      brands.push(newBrand);
      writeJsonFile('brands.json', brands);
      return newBrand;
    },

    update: (options: { where: { id: string }; data: Partial<Brand> }): Brand | null => {
      const brands = readJsonFile<Brand[]>('brands.json');
      const index = brands.findIndex(b => b.id === options.where.id);
      if (index === -1) return null;

      brands[index] = { ...brands[index], ...options.data };
      writeJsonFile('brands.json', brands);
      return brands[index];
    },

    delete: (options: { where: { id: string } }): boolean => {
      const brands = readJsonFile<Brand[]>('brands.json');
      const index = brands.findIndex(b => b.id === options.where.id);
      if (index === -1) return false;

      brands.splice(index, 1);
      writeJsonFile('brands.json', brands);
      return true;
    },

    count: (options?: { where?: { isActive?: boolean } }): number => {
      let brands = readJsonFile<Brand[]>('brands.json');
      if (options?.where?.isActive !== undefined) {
        brands = brands.filter(b => b.isActive === options.where!.isActive);
      }
      return brands.length;
    },
  },

  // ==================== Vehicles ====================
  vehicles: {
    findMany: (options?: {
      where?: { isActive?: boolean; isPopular?: boolean; brandId?: string; category?: string };
      include?: { brand?: boolean };
      orderBy?: Array<{ [key: string]: 'asc' | 'desc' }> | { [key: string]: 'asc' | 'desc' };
    }): (Vehicle | VehicleWithBrand)[] => {
      let vehicles = readJsonFile<Vehicle[]>('vehicles.json');
      const brands = readJsonFile<Brand[]>('brands.json');

      // Filter
      if (options?.where) {
        if (options.where.isActive !== undefined) {
          vehicles = vehicles.filter(v => v.isActive === options.where!.isActive);
        }
        if (options.where.isPopular !== undefined) {
          vehicles = vehicles.filter(v => v.isPopular === options.where!.isPopular);
        }
        if (options.where.brandId) {
          vehicles = vehicles.filter(v => v.brandId === options.where!.brandId);
        }
        if (options.where.category) {
          vehicles = vehicles.filter(v => v.category === options.where!.category);
        }
      }

      // Sort
      if (options?.orderBy) {
        const orderByArray = Array.isArray(options.orderBy) ? options.orderBy : [options.orderBy];
        vehicles.sort((a, b) => {
          for (const order of orderByArray) {
            const key = Object.keys(order)[0] as keyof Vehicle;
            const direction = order[key];
            const aVal = a[key];
            const bVal = b[key];

            if (aVal === bVal) continue;

            if (typeof aVal === 'boolean') {
              return direction === 'desc' ? (bVal ? 1 : -1) : (aVal ? 1 : -1);
            }
            if (typeof aVal === 'number' && typeof bVal === 'number') {
              return direction === 'asc' ? aVal - bVal : bVal - aVal;
            }
            if (typeof aVal === 'string' && typeof bVal === 'string') {
              return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
          }
          return 0;
        });
      }

      // Include brand
      if (options?.include?.brand) {
        return vehicles.map(v => ({
          ...v,
          brand: brands.find(b => b.id === v.brandId)!,
        }));
      }

      return vehicles;
    },

    findUnique: (options: { where: { id: string }; include?: { brand?: boolean } }): (Vehicle | VehicleWithBrand) | null => {
      const vehicles = readJsonFile<Vehicle[]>('vehicles.json');
      const vehicle = vehicles.find(v => v.id === options.where.id);
      if (!vehicle) return null;

      if (options.include?.brand) {
        const brands = readJsonFile<Brand[]>('brands.json');
        return {
          ...vehicle,
          brand: brands.find(b => b.id === vehicle.brandId)!,
        };
      }

      return vehicle;
    },

    create: (options: { data: Omit<Vehicle, 'id'> & { id?: string } }): Vehicle => {
      const vehicles = readJsonFile<Vehicle[]>('vehicles.json');
      // 유니크 ID 생성 (브랜드+카테고리+차량명 기반)
      let vehicleId = options.data.id || generateVehicleId(
        options.data.brandId,
        options.data.category,
        options.data.name
      );

      // 중복 ID 확인 및 처리
      let counter = 1;
      const baseId = vehicleId;
      while (vehicles.some(v => v.id === vehicleId)) {
        vehicleId = `${baseId}-${counter}`;
        counter++;
      }

      const { id: _id, ...dataWithoutId } = options.data as { id?: string } & Omit<Vehicle, 'id'>;
      const newVehicle: Vehicle = {
        id: vehicleId,
        ...dataWithoutId,
      } as Vehicle;
      vehicles.push(newVehicle);
      writeJsonFile('vehicles.json', vehicles);
      return newVehicle;
    },

    update: (options: { where: { id: string }; data: Partial<Vehicle> }): Vehicle | null => {
      const vehicles = readJsonFile<Vehicle[]>('vehicles.json');
      const index = vehicles.findIndex(v => v.id === options.where.id);
      if (index === -1) return null;

      vehicles[index] = { ...vehicles[index], ...options.data };
      writeJsonFile('vehicles.json', vehicles);
      return vehicles[index];
    },

    delete: (options: { where: { id: string } }): boolean => {
      const vehicles = readJsonFile<Vehicle[]>('vehicles.json');
      const index = vehicles.findIndex(v => v.id === options.where.id);
      if (index === -1) return false;

      vehicles.splice(index, 1);
      writeJsonFile('vehicles.json', vehicles);
      return true;
    },

    count: (options?: { where?: { isActive?: boolean; isPopular?: boolean } }): number => {
      let vehicles = readJsonFile<Vehicle[]>('vehicles.json');
      if (options?.where) {
        if (options.where.isActive !== undefined) {
          vehicles = vehicles.filter(v => v.isActive === options.where!.isActive);
        }
        if (options.where.isPopular !== undefined) {
          vehicles = vehicles.filter(v => v.isPopular === options.where!.isPopular);
        }
      }
      return vehicles.length;
    },
  },

  // ==================== FAQs ====================
  faqs: {
    findMany: (options?: { where?: { isActive?: boolean }; orderBy?: { sortOrder?: 'asc' | 'desc' } }): FAQ[] => {
      let faqs = readJsonFile<FAQ[]>('faqs.json');

      if (options?.where?.isActive !== undefined) {
        faqs = faqs.filter(f => f.isActive === options.where!.isActive);
      }

      if (options?.orderBy?.sortOrder) {
        faqs.sort((a, b) =>
          options.orderBy!.sortOrder === 'asc'
            ? a.sortOrder - b.sortOrder
            : b.sortOrder - a.sortOrder
        );
      }

      return faqs;
    },

    findUnique: (options: { where: { id: string } }): FAQ | null => {
      const faqs = readJsonFile<FAQ[]>('faqs.json');
      return faqs.find(f => f.id === options.where.id) || null;
    },

    create: (options: { data: Omit<FAQ, 'id'> }): FAQ => {
      const faqs = readJsonFile<FAQ[]>('faqs.json');
      const newFaq: FAQ = {
        id: generateId('faq'),
        ...options.data,
      };
      faqs.push(newFaq);
      writeJsonFile('faqs.json', faqs);
      return newFaq;
    },

    update: (options: { where: { id: string }; data: Partial<FAQ> }): FAQ | null => {
      const faqs = readJsonFile<FAQ[]>('faqs.json');
      const index = faqs.findIndex(f => f.id === options.where.id);
      if (index === -1) return null;

      faqs[index] = { ...faqs[index], ...options.data };
      writeJsonFile('faqs.json', faqs);
      return faqs[index];
    },

    delete: (options: { where: { id: string } }): boolean => {
      const faqs = readJsonFile<FAQ[]>('faqs.json');
      const index = faqs.findIndex(f => f.id === options.where.id);
      if (index === -1) return false;

      faqs.splice(index, 1);
      writeJsonFile('faqs.json', faqs);
      return true;
    },

    count: (options?: { where?: { isActive?: boolean } }): number => {
      let faqs = readJsonFile<FAQ[]>('faqs.json');
      if (options?.where?.isActive !== undefined) {
        faqs = faqs.filter(f => f.isActive === options.where!.isActive);
      }
      return faqs.length;
    },
  },

  // ==================== Settings ====================
  settings: {
    findMany: (): Array<{ key: string; value: string }> => {
      const settings = readJsonFile<Settings>('settings.json');
      return Object.entries(settings).map(([key, value]) => ({ key, value }));
    },

    get: (key: string): string | null => {
      const settings = readJsonFile<Settings>('settings.json');
      return settings[key] || null;
    },

    set: (key: string, value: string): void => {
      const settings = readJsonFile<Settings>('settings.json');
      settings[key] = value;
      writeJsonFile('settings.json', settings);
    },

    upsert: (options: { where: { key: string }; update: { value: string }; create: { key: string; value: string } }): { key: string; value: string } => {
      const settings = readJsonFile<Settings>('settings.json');
      settings[options.where.key] = options.update.value;
      writeJsonFile('settings.json', settings);
      return { key: options.where.key, value: options.update.value };
    },
  },

  // ==================== Admins ====================
  admins: {
    findUnique: (options: { where: { email: string } }): LocalAdmin | null => {
      const admins = readJsonFile<LocalAdmin[]>('admins.json');
      return admins.find(a => a.email === options.where.email) || null;
    },
  },

  // ==================== Trims ====================
  trims: {
    findMany: (options?: { where?: { vehicleId?: string }; orderBy?: { sortOrder?: 'asc' | 'desc' } }): Trim[] => {
      let trims: Trim[] = [];
      try {
        trims = readJsonFile<Trim[]>('trims.json');
      } catch {
        return [];
      }

      if (options?.where?.vehicleId) {
        trims = trims.filter(t => t.vehicleId === options.where!.vehicleId);
      }

      if (options?.orderBy?.sortOrder) {
        trims.sort((a, b) =>
          options.orderBy!.sortOrder === 'asc'
            ? a.sortOrder - b.sortOrder
            : b.sortOrder - a.sortOrder
        );
      }

      return trims;
    },

    create: (options: { data: Omit<Trim, 'id'> }): Trim => {
      let trims: Trim[] = [];
      try {
        trims = readJsonFile<Trim[]>('trims.json');
      } catch {
        trims = [];
      }
      const newTrim: Trim = {
        id: generateId('trim'),
        ...options.data,
      };
      trims.push(newTrim);
      writeJsonFile('trims.json', trims);
      return newTrim;
    },

    update: (options: { where: { id: string }; data: Partial<Trim> }): Trim | null => {
      let trims: Trim[] = [];
      try {
        trims = readJsonFile<Trim[]>('trims.json');
      } catch {
        return null;
      }
      const index = trims.findIndex(t => t.id === options.where.id);
      if (index === -1) return null;

      trims[index] = { ...trims[index], ...options.data };
      writeJsonFile('trims.json', trims);
      return trims[index];
    },

    delete: (options: { where: { id: string } }): boolean => {
      let trims: Trim[] = [];
      try {
        trims = readJsonFile<Trim[]>('trims.json');
      } catch {
        return false;
      }
      const index = trims.findIndex(t => t.id === options.where.id);
      if (index === -1) return false;

      trims.splice(index, 1);
      writeJsonFile('trims.json', trims);
      return true;
    },

    deleteMany: (options: { where: { vehicleId: string } }): number => {
      let trims: Trim[] = [];
      try {
        trims = readJsonFile<Trim[]>('trims.json');
      } catch {
        return 0;
      }
      const originalLength = trims.length;
      trims = trims.filter(t => t.vehicleId !== options.where.vehicleId);
      writeJsonFile('trims.json', trims);
      return originalLength - trims.length;
    },
  },

  // ==================== Colors ====================
  colors: {
    findMany: (options?: { where?: { vehicleId?: string; type?: 'EXTERIOR' | 'INTERIOR' }; orderBy?: { sortOrder?: 'asc' | 'desc' } }): Color[] => {
      let colors: Color[] = [];
      try {
        colors = readJsonFile<Color[]>('colors.json');
      } catch {
        return [];
      }

      if (options?.where?.vehicleId) {
        colors = colors.filter(c => c.vehicleId === options.where!.vehicleId);
      }
      if (options?.where?.type) {
        colors = colors.filter(c => c.type === options.where!.type);
      }

      if (options?.orderBy?.sortOrder) {
        colors.sort((a, b) =>
          options.orderBy!.sortOrder === 'asc'
            ? a.sortOrder - b.sortOrder
            : b.sortOrder - a.sortOrder
        );
      }

      return colors;
    },

    create: (options: { data: Omit<Color, 'id'> }): Color => {
      let colors: Color[] = [];
      try {
        colors = readJsonFile<Color[]>('colors.json');
      } catch {
        colors = [];
      }
      const newColor: Color = {
        id: generateId('color'),
        ...options.data,
      };
      colors.push(newColor);
      writeJsonFile('colors.json', colors);
      return newColor;
    },

    update: (options: { where: { id: string }; data: Partial<Color> }): Color | null => {
      let colors: Color[] = [];
      try {
        colors = readJsonFile<Color[]>('colors.json');
      } catch {
        return null;
      }
      const index = colors.findIndex(c => c.id === options.where.id);
      if (index === -1) return null;

      colors[index] = { ...colors[index], ...options.data };
      writeJsonFile('colors.json', colors);
      return colors[index];
    },

    delete: (options: { where: { id: string } }): boolean => {
      let colors: Color[] = [];
      try {
        colors = readJsonFile<Color[]>('colors.json');
      } catch {
        return false;
      }
      const index = colors.findIndex(c => c.id === options.where.id);
      if (index === -1) return false;

      colors.splice(index, 1);
      writeJsonFile('colors.json', colors);
      return true;
    },

    deleteMany: (options: { where: { vehicleId: string } }): number => {
      let colors: Color[] = [];
      try {
        colors = readJsonFile<Color[]>('colors.json');
      } catch {
        return 0;
      }
      const originalLength = colors.length;
      colors = colors.filter(c => c.vehicleId !== options.where.vehicleId);
      writeJsonFile('colors.json', colors);
      return originalLength - colors.length;
    },
  },

  // ==================== Options ====================
  options: {
    findMany: (options?: { where?: { vehicleId?: string; category?: string }; orderBy?: { sortOrder?: 'asc' | 'desc' } }): VehicleOption[] => {
      let vehicleOptions: VehicleOption[] = [];
      try {
        vehicleOptions = readJsonFile<VehicleOption[]>('options.json');
      } catch {
        return [];
      }

      if (options?.where?.vehicleId) {
        vehicleOptions = vehicleOptions.filter(o => o.vehicleId === options.where!.vehicleId);
      }
      if (options?.where?.category) {
        vehicleOptions = vehicleOptions.filter(o => o.category === options.where!.category);
      }

      if (options?.orderBy?.sortOrder) {
        vehicleOptions.sort((a, b) =>
          options.orderBy!.sortOrder === 'asc'
            ? a.sortOrder - b.sortOrder
            : b.sortOrder - a.sortOrder
        );
      }

      return vehicleOptions;
    },

    create: (options: { data: Omit<VehicleOption, 'id'> }): VehicleOption => {
      let vehicleOptions: VehicleOption[] = [];
      try {
        vehicleOptions = readJsonFile<VehicleOption[]>('options.json');
      } catch {
        vehicleOptions = [];
      }
      const newOption: VehicleOption = {
        id: generateId('option'),
        ...options.data,
      };
      vehicleOptions.push(newOption);
      writeJsonFile('options.json', vehicleOptions);
      return newOption;
    },

    update: (options: { where: { id: string }; data: Partial<VehicleOption> }): VehicleOption | null => {
      let vehicleOptions: VehicleOption[] = [];
      try {
        vehicleOptions = readJsonFile<VehicleOption[]>('options.json');
      } catch {
        return null;
      }
      const index = vehicleOptions.findIndex(o => o.id === options.where.id);
      if (index === -1) return null;

      vehicleOptions[index] = { ...vehicleOptions[index], ...options.data };
      writeJsonFile('options.json', vehicleOptions);
      return vehicleOptions[index];
    },

    delete: (options: { where: { id: string } }): boolean => {
      let vehicleOptions: VehicleOption[] = [];
      try {
        vehicleOptions = readJsonFile<VehicleOption[]>('options.json');
      } catch {
        return false;
      }
      const index = vehicleOptions.findIndex(o => o.id === options.where.id);
      if (index === -1) return false;

      vehicleOptions.splice(index, 1);
      writeJsonFile('options.json', vehicleOptions);
      return true;
    },

    deleteMany: (options: { where: { vehicleId: string } }): number => {
      let vehicleOptions: VehicleOption[] = [];
      try {
        vehicleOptions = readJsonFile<VehicleOption[]>('options.json');
      } catch {
        return 0;
      }
      const originalLength = vehicleOptions.length;
      vehicleOptions = vehicleOptions.filter(o => o.vehicleId !== options.where.vehicleId);
      writeJsonFile('options.json', vehicleOptions);
      return originalLength - vehicleOptions.length;
    },
  },
};
