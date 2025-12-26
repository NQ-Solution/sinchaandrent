export type VehicleCategory = 'SEDAN' | 'SUV' | 'TRUCK' | 'VAN' | 'EV';
export type FuelType = 'GASOLINE' | 'DIESEL' | 'HYBRID' | 'EV' | 'LPG';
export type ColorType = 'EXTERIOR' | 'INTERIOR';
export type RentPeriod = 24 | 36 | 48 | 60;

export interface Brand {
  id: string;
  name: string;
  nameKr: string;
  nameEn?: string | null;
  logo?: string | null;
  isDomestic: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle {
  id: string;
  brandId: string;
  brand?: Brand;
  name: string;
  category: VehicleCategory;
  fuelTypes: string[];  // 복수 선택 가능
  driveTypes: string[];
  seatingCapacityMin?: number | null;  // 최소 승차 인원
  seatingCapacityMax?: number | null;  // 최대 승차 인원
  basePrice: number;
  // 보증금 0% 렌트 가격
  rentPrice60_0?: number | null;
  rentPrice48_0?: number | null;
  rentPrice36_0?: number | null;
  rentPrice24_0?: number | null;
  // 보증금 25% 렌트 가격
  rentPrice60_25?: number | null;
  rentPrice48_25?: number | null;
  rentPrice36_25?: number | null;
  rentPrice24_25?: number | null;
  // 보증금 50% 렌트 가격
  rentPrice60_50?: number | null;
  rentPrice48_50?: number | null;
  rentPrice36_50?: number | null;
  rentPrice24_50?: number | null;
  thumbnail?: string | null;
  images: string[];
  imageSizePreset?: string | null;
  imagePadding?: number | null;
  isPopular: boolean;
  isNew: boolean;
  isActive: boolean;
  sortOrder: number;
  trims?: Trim[];
  colors?: Color[];
  options?: Option[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Trim {
  id: string;
  vehicleId: string;
  name: string;
  description?: string | null;
  price: number;
  sortOrder: number;
}

export interface Color {
  id: string;
  vehicleId: string;
  type: ColorType;
  name: string;
  hexCode: string;
  price: number;
  sortOrder: number;
}

export interface Option {
  id: string;
  vehicleId: string;
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
  sortOrder: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  description?: string | null;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  image?: string | null;
  mobileImage?: string | null;
  link?: string | null;
  linkText?: string | null;
  description?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Partner {
  id: string;
  name: string;
  logo?: string | null;
  link?: string | null;
  category?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyInfo {
  id: string;
  key: string;
  value: string;
  description?: string | null;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface VehiclesQueryParams {
  brandId?: string;
  category?: VehicleCategory;
  fuelType?: string;  // 연료 타입 필터 (단일)
  isPopular?: boolean;
  isNew?: boolean;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'name';
}

// Vehicle Selection State (for quote)
export interface VehicleSelection {
  vehicleId: string;
  trimId?: string;
  exteriorColorId?: string;
  interiorColorId?: string;
  optionIds: string[];
  period: RentPeriod;
}
